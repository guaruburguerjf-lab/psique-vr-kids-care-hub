-- ===== Enums =====
CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.patient_modality AS ENUM ('adulto', 'infantil');
CREATE TYPE public.consent_status AS ENUM ('pendente', 'concedido', 'revogado');
CREATE TYPE public.audience AS ENUM ('adulto', 'infantil');
CREATE TYPE public.publication_status AS ENUM ('rascunho', 'publicado', 'arquivado');
CREATE TYPE public.session_status AS ENUM ('agendada', 'em_andamento', 'interrompida', 'concluida', 'cancelada');
CREATE TYPE public.session_mode AS ENUM ('vr', 'tela');
CREATE TYPE public.goal_status AS ENUM ('ativo', 'alcancado', 'pausado');

-- ===== updated_at helper =====
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ===== profiles =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  crp text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== user_roles =====
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- New account: profile + admin role only for the very first account (single psychologist).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== patients (dados cadastrais) =====
CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  internal_code text NOT NULL,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 200),
  birth_date date NOT NULL,
  modality public.patient_modality NOT NULL,
  therapeutic_goals text,
  consent_status public.consent_status NOT NULL DEFAULT 'pendente',
  professional_notes text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, internal_code)
);
CREATE INDEX patients_owner_idx ON public.patients(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin owns patients" ON public.patients FOR ALL TO authenticated
  USING (owner_id = auth.uid() AND public.is_admin())
  WITH CHECK (owner_id = auth.uid() AND public.is_admin());
CREATE TRIGGER patients_updated BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.owns_patient(_patient_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.patients WHERE id = _patient_id AND owner_id = auth.uid())
$$;

-- ===== guardians =====
CREATE TABLE public.guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 200),
  relationship text NOT NULL,
  document text,
  phone text,
  email text,
  is_legal_guardian boolean NOT NULL DEFAULT true,
  authorization_granted boolean NOT NULL DEFAULT false,
  authorization_date date,
  authorization_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX guardians_patient_idx ON public.guardians(patient_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardians TO authenticated;
GRANT ALL ON public.guardians TO service_role;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin owns guardians" ON public.guardians FOR ALL TO authenticated
  USING (owner_id = auth.uid() AND public.is_admin())
  WITH CHECK (owner_id = auth.uid() AND public.is_admin() AND public.owns_patient(patient_id));
CREATE TRIGGER guardians_updated BEFORE UPDATE ON public.guardians FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== consents =====
CREATE TABLE public.consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  guardian_id uuid REFERENCES public.guardians(id) ON DELETE SET NULL,
  consent_type text NOT NULL,
  status public.consent_status NOT NULL DEFAULT 'pendente',
  document_version text,
  granted_at timestamptz,
  revoked_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX consents_patient_idx ON public.consents(patient_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consents TO authenticated;
GRANT ALL ON public.consents TO service_role;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin owns consents" ON public.consents FOR ALL TO authenticated
  USING (owner_id = auth.uid() AND public.is_admin())
  WITH CHECK (owner_id = auth.uid() AND public.is_admin() AND public.owns_patient(patient_id));
CREATE TRIGGER consents_updated BEFORE UPDATE ON public.consents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== clinical_goals =====
CREATE TABLE public.clinical_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status public.goal_status NOT NULL DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX clinical_goals_patient_idx ON public.clinical_goals(patient_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinical_goals TO authenticated;
GRANT ALL ON public.clinical_goals TO service_role;
ALTER TABLE public.clinical_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin owns goals" ON public.clinical_goals FOR ALL TO authenticated
  USING (owner_id = auth.uid() AND public.is_admin())
  WITH CHECK (owner_id = auth.uid() AND public.is_admin() AND public.owns_patient(patient_id));
CREATE TRIGGER clinical_goals_updated BEFORE UPDATE ON public.clinical_goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== experiences (catálogo do sistema owner_id NULL + experiências próprias) =====
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  audience public.audience NOT NULL,
  category text NOT NULL,
  objective text,
  suggested_duration_min integer NOT NULL DEFAULT 10 CHECK (suggested_duration_min BETWEEN 1 AND 120),
  indications text,
  contraindications text,
  status public.publication_status NOT NULL DEFAULT 'rascunho',
  requires_vr boolean NOT NULL DEFAULT true,
  min_age integer NOT NULL DEFAULT 10,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX experiences_audience_idx ON public.experiences(audience, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
GRANT ALL ON public.experiences TO service_role;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads experiences" ON public.experiences FOR SELECT TO authenticated
  USING (public.is_admin() AND (owner_id IS NULL OR owner_id = auth.uid()));
CREATE POLICY "Admin inserts own experiences" ON public.experiences FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() AND owner_id = auth.uid());
CREATE POLICY "Admin updates own experiences" ON public.experiences FOR UPDATE TO authenticated
  USING (public.is_admin() AND owner_id = auth.uid()) WITH CHECK (public.is_admin() AND owner_id = auth.uid());
CREATE POLICY "Admin deletes own experiences" ON public.experiences FOR DELETE TO authenticated
  USING (public.is_admin() AND owner_id = auth.uid());
CREATE TRIGGER experiences_updated BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== sessions =====
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  experience_id uuid REFERENCES public.experiences(id) ON DELETE SET NULL,
  mode public.session_mode NOT NULL DEFAULT 'vr',
  objective text,
  planned_duration_min integer NOT NULL DEFAULT 10 CHECK (planned_duration_min BETWEEN 1 AND 120),
  status public.session_status NOT NULL DEFAULT 'agendada',
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  access_code_hash text,
  access_code_expires_at timestamptz,
  access_code_used_at timestamptz,
  self_report jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_owner_status_idx ON public.sessions(owner_id, status);
CREATE INDEX sessions_patient_idx ON public.sessions(patient_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT ALL ON public.sessions TO service_role;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin owns sessions" ON public.sessions FOR ALL TO authenticated
  USING (owner_id = auth.uid() AND public.is_admin())
  WITH CHECK (owner_id = auth.uid() AND public.is_admin() AND public.owns_patient(patient_id));
CREATE TRIGGER sessions_updated BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Bloqueio de VR para pacientes abaixo da idade mínima (Meta: 10 anos)
CREATE OR REPLACE FUNCTION public.enforce_vr_age()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE _birth date; _min int := 10;
BEGIN
  IF NEW.mode = 'vr' THEN
    SELECT birth_date INTO _birth FROM public.patients WHERE id = NEW.patient_id;
    IF NEW.experience_id IS NOT NULL THEN
      SELECT GREATEST(10, min_age) INTO _min FROM public.experiences WHERE id = NEW.experience_id;
    END IF;
    IF _birth IS NULL OR date_part('year', age(current_date, _birth)) < _min THEN
      RAISE EXCEPTION 'Paciente abaixo da idade mínima para uso do headset (% anos).', _min;
    END IF;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER sessions_vr_age BEFORE INSERT OR UPDATE OF mode, patient_id, experience_id ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_vr_age();

-- ===== session_events =====
CREATE TABLE public.session_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX session_events_session_idx ON public.session_events(session_id, occurred_at);
GRANT SELECT, INSERT ON public.session_events TO authenticated;
GRANT ALL ON public.session_events TO service_role;
ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads events" ON public.session_events FOR SELECT TO authenticated
  USING (owner_id = auth.uid() AND public.is_admin());
CREATE POLICY "Admin inserts events" ON public.session_events FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() AND public.is_admin()
    AND EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = session_id AND s.owner_id = auth.uid()));

-- ===== assessments =====
CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  instrument text NOT NULL,
  moment text,
  score numeric,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX assessments_patient_idx ON public.assessments(patient_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin owns assessments" ON public.assessments FOR ALL TO authenticated
  USING (owner_id = auth.uid() AND public.is_admin())
  WITH CHECK (owner_id = auth.uid() AND public.is_admin() AND public.owns_patient(patient_id));
CREATE TRIGGER assessments_updated BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== clinical_notes (dados clínicos separados dos cadastrais) =====
CREATE TABLE public.clinical_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX clinical_notes_patient_idx ON public.clinical_notes(patient_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinical_notes TO authenticated;
GRANT ALL ON public.clinical_notes TO service_role;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin owns notes" ON public.clinical_notes FOR ALL TO authenticated
  USING (owner_id = auth.uid() AND public.is_admin())
  WITH CHECK (owner_id = auth.uid() AND public.is_admin() AND public.owns_patient(patient_id));
CREATE TRIGGER clinical_notes_updated BEFORE UPDATE ON public.clinical_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== ai_characters =====
CREATE TABLE public.ai_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  audience public.audience NOT NULL DEFAULT 'infantil',
  persona text,
  enabled_for_patients boolean NOT NULL DEFAULT false,
  safety_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_characters TO authenticated;
GRANT ALL ON public.ai_characters TO service_role;
ALTER TABLE public.ai_characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads characters" ON public.ai_characters FOR SELECT TO authenticated
  USING (public.is_admin() AND (owner_id IS NULL OR owner_id = auth.uid()));
CREATE POLICY "Admin writes own characters" ON public.ai_characters FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() AND owner_id = auth.uid());
CREATE POLICY "Admin updates own characters" ON public.ai_characters FOR UPDATE TO authenticated
  USING (public.is_admin() AND owner_id = auth.uid()) WITH CHECK (public.is_admin() AND owner_id = auth.uid());
CREATE POLICY "Admin deletes own characters" ON public.ai_characters FOR DELETE TO authenticated
  USING (public.is_admin() AND owner_id = auth.uid());
CREATE TRIGGER ai_characters_updated BEFORE UPDATE ON public.ai_characters FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== ai_content (conteúdo aprovado pelo psicólogo) =====
CREATE TABLE public.ai_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  character_id uuid NOT NULL REFERENCES public.ai_characters(id) ON DELETE CASCADE,
  content_type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_content_character_idx ON public.ai_content(character_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_content TO authenticated;
GRANT ALL ON public.ai_content TO service_role;
ALTER TABLE public.ai_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin owns ai content" ON public.ai_content FOR ALL TO authenticated
  USING (owner_id = auth.uid() AND public.is_admin())
  WITH CHECK (owner_id = auth.uid() AND public.is_admin());
CREATE TRIGGER ai_content_updated BEFORE UPDATE ON public.ai_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== audit_logs (somente leitura; gravado por gatilhos) =====
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  actor_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_owner_idx ON public.audit_logs(owner_id, created_at DESC);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin reads own audit" ON public.audit_logs FOR SELECT TO authenticated
  USING (owner_id = auth.uid() AND public.is_admin());

CREATE OR REPLACE FUNCTION public.write_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row record; _summary text;
BEGIN
  IF TG_OP = 'DELETE' THEN _row := OLD; ELSE _row := NEW; END IF;
  _summary := CASE TG_TABLE_NAME
    WHEN 'patients' THEN 'Paciente ' || _row.internal_code
    WHEN 'guardians' THEN 'Responsável vinculado'
    WHEN 'sessions' THEN 'Sessão ' || _row.status::text
    ELSE TG_TABLE_NAME END;
  INSERT INTO public.audit_logs (owner_id, actor_id, action, entity, entity_id, summary)
  VALUES (_row.owner_id, auth.uid(), lower(TG_OP), TG_TABLE_NAME, _row.id, _summary);
  RETURN NULL;
END; $$;
CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.write_audit();
CREATE TRIGGER audit_guardians AFTER INSERT OR UPDATE OR DELETE ON public.guardians FOR EACH ROW EXECUTE FUNCTION public.write_audit();
CREATE TRIGGER audit_consents AFTER INSERT OR UPDATE OR DELETE ON public.consents FOR EACH ROW EXECUTE FUNCTION public.write_audit();
CREATE TRIGGER audit_sessions AFTER INSERT OR UPDATE OR DELETE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.write_audit();
CREATE TRIGGER audit_clinical_notes AFTER INSERT OR UPDATE OR DELETE ON public.clinical_notes FOR EACH ROW EXECUTE FUNCTION public.write_audit();

REVOKE EXECUTE ON FUNCTION public.write_audit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ===== Catálogo inicial (conteúdo do sistema, não são dados de pacientes) =====
INSERT INTO public.experiences (slug, name, description, audience, category, objective, suggested_duration_min, indications, contraindications, status, requires_vr, min_age) VALUES
('respiracao-praia', 'Praia Serena', 'Ambiente litorâneo para relaxamento com respiração guiada.', 'adulto', 'Relaxamento', 'Apoiar o relaxamento durante a sessão.', 10, 'Uso supervisionado em sessão.', 'Cinetose, epilepsia fotossensível, crises agudas.', 'rascunho', true, 13),
('ansiedade-jardim', 'Jardim do Equilíbrio', 'Psicoeducação sobre ansiedade em um jardim tranquilo.', 'adulto', 'Ansiedade', 'Psicoeducação sobre sinais de ansiedade.', 12, 'Uso supervisionado em sessão.', 'Cinetose, epilepsia fotossensível.', 'rascunho', true, 13),
('mindfulness-montanha', 'Mirante da Atenção', 'Prática de atenção plena com paisagem de montanha.', 'adulto', 'Mindfulness', 'Treino de atenção ao momento presente.', 10, 'Uso supervisionado em sessão.', 'Cinetose.', 'rascunho', true, 13),
('emocoes-adulto', 'Sala das Emoções', 'Exploração guiada de nomeação de emoções.', 'adulto', 'Inteligência emocional', 'Apoiar o reconhecimento emocional.', 15, 'Uso supervisionado em sessão.', 'Cinetose.', 'rascunho', true, 13),
('autoconhecimento-lago', 'Lago do Reflexo', 'Ambiente reflexivo para atividades de autoconhecimento.', 'adulto', 'Autoconhecimento', 'Favorecer reflexão orientada pelo profissional.', 15, 'Uso supervisionado em sessão.', 'Cinetose.', 'rascunho', true, 13),
('psicoeducacao-estudio', 'Estúdio Psicoeducativo', 'Conteúdos psicoeducativos ilustrados.', 'adulto', 'Psicoeducação', 'Apresentar conteúdos educativos.', 10, 'Uso supervisionado em sessão.', 'Cinetose.', 'rascunho', true, 13),
('exposicao-gradual', 'Exposição Gradual', 'Estrutura para cenários de exposição graduada controlados pelo profissional.', 'adulto', 'Exposição gradual', 'Apoiar protocolos conduzidos pelo psicólogo.', 15, 'Somente com planejamento clínico.', 'Crises agudas, cinetose.', 'rascunho', true, 13),
('ilha-das-emocoes', 'Ilha das Emoções', 'Ilha lúdica para reconhecer emoções básicas.', 'infantil', 'PSIQUE KIDS', 'Educação emocional lúdica.', 8, 'Uso supervisionado com autorização do responsável.', 'Cinetose, epilepsia fotossensível.', 'rascunho', true, 10),
('floresta-da-coragem', 'Floresta da Coragem', 'Trilha com pequenos desafios de coragem.', 'infantil', 'PSIQUE KIDS', 'Educação emocional sobre medo e coragem.', 8, 'Uso supervisionado com autorização do responsável.', 'Cinetose.', 'rascunho', true, 10),
('oceano-da-calma', 'Oceano da Calma', 'Oceano panorâmico com ondas suaves e respiração guiada.', 'infantil', 'PSIQUE KIDS', 'Apoiar a autorregulação por respiração guiada.', 6, 'Uso supervisionado com autorização do responsável.', 'Cinetose, epilepsia fotossensível.', 'publicado', true, 10),
('escola-dos-amigos', 'Escola dos Amigos', 'Situações sociais do cotidiano escolar.', 'infantil', 'PSIQUE KIDS', 'Educação sobre habilidades sociais.', 10, 'Uso supervisionado com autorização do responsável.', 'Cinetose.', 'rascunho', true, 10),
('castelo-dos-sonhos', 'Castelo dos Sonhos', 'Castelo de histórias para imaginação e expressão.', 'infantil', 'PSIQUE KIDS', 'Estimular expressão por histórias.', 10, 'Uso supervisionado com autorização do responsável.', 'Cinetose.', 'rascunho', true, 10);

INSERT INTO public.ai_characters (slug, name, description, audience, persona, enabled_for_patients, safety_config) VALUES
('lumi', 'LUMI', 'Personagem acolhedor e educativo do PSIQUE KIDS.', 'infantil',
 'Amigável, calmo e educativo. Explica emoções, conta histórias, faz perguntas simples e guia respirações.',
 false,
 '{"no_diagnosis":true,"no_treatment":true,"no_personal_data":true,"no_secrets":true,"store_conversations":false,"escalate_on_risk":true,"max_turns":12}'::jsonb);