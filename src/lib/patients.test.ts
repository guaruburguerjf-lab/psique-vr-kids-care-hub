import { describe, expect, it } from "vitest";
import { ageFromBirthDate, canUseVr, isMinor } from "./patients";

const today = new Date("2026-11-07T12:00:00");

describe("regras de pacientes", () => {
  it("calcula idade considerando o aniversário ainda não ocorrido", () => {
    expect(ageFromBirthDate("2016-11-08", today)).toBe(9);
    expect(ageFromBirthDate("2016-11-07", today)).toBe(10);
  });
  it("bloqueia VR abaixo de 10 anos (idade mínima Meta)", () => {
    expect(canUseVr(9)).toBe(false);
    expect(canUseVr(10)).toBe(true);
  });
  it("respeita idade mínima maior da experiência", () => {
    expect(canUseVr(12, 13)).toBe(false);
  });
  it("menor de 18 exige responsável", () => {
    expect(isMinor(17)).toBe(true);
    expect(isMinor(18)).toBe(false);
  });
});
