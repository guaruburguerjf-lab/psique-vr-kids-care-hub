import { z } from "zod";

/** Meta Quest: idade mínima para uso do headset (contas supervisionadas pelos pais). */
export const META_MIN_VR_AGE = 10;
/** Maioridade civil (ECA / Código Civil): abaixo disso exige responsável legal. */
export const ADULT_AGE = 18;

export function ageFromBirthDate(birthDate: string | Date, today: Date = new Date()): number {
  const b = typeof birthDate === "string" ? new Date(birthDate + "T00:00:00") : birthDate;
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

export function ageRange(age: number): string {
  if (age < 6) return "Primeira infância (0–5)";
  if (age < 12) return "Infância (6–11)";
  if (age < 18) return "Adolescência (12–17)";
  if (age < 60) return "Adulto (18–59)";
  return "Idoso (60+)";
}

export function isMinor(age: number) {
  return age < ADULT_AGE;
}

export function canUseVr(age: number, experienceMinAge = META_MIN_VR_AGE) {
  return age >= Math.max(META_MIN_VR_AGE, experienceMinAge);
}

export const patientSchema = z.object({
  internal_code: z.string().trim().min(1, "Informe o identificador").max(40),
  full_name: z.string().trim().min(2, "Nome muito curto").max(200),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .refine((d) => new Date(d) <= new Date(), "Data no futuro"),
  modality: z.enum(["adulto", "infantil"]),
  therapeutic_goals: z.string().max(4000).optional().or(z.literal("")),
  consent_status: z.enum(["pendente", "concedido", "revogado"]),
  professional_notes: z.string().max(8000).optional().or(z.literal("")),
});
export type PatientInput = z.infer<typeof patientSchema>;

export const guardianSchema = z.object({
  full_name: z.string().trim().min(2, "Nome muito curto").max(200),
  relationship: z.string().trim().min(2, "Informe o vínculo").max(60),
  document: z.string().trim().max(30).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").max(255).optional().or(z.literal("")),
  is_legal_guardian: z.boolean(),
  authorization_granted: z.boolean(),
  authorization_date: z.string().optional().or(z.literal("")),
  authorization_notes: z.string().max(2000).optional().or(z.literal("")),
});
export type GuardianInput = z.infer<typeof guardianSchema>;

export const consentLabel: Record<string, string> = {
  pendente: "Pendente",
  concedido: "Concedido",
  revogado: "Revogado",
};
