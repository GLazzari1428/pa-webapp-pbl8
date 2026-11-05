import { describe, expect, it } from "vitest";
import { stepPendingLabel } from "../src/lib/wizard-status";
import { removeCase, restoreCase } from "../src/lib/storage";
import { CASO_A, CONECTAHIT, SQUAD } from "../src/lib/data/examples";

describe("Rótulo de pendência por etapa", () => {
  it("na etapa Decisão, diz que falta a decisão humana em vez de contar pendências", () => {
    expect(stepPendingLabel("decision", 1)).toBe("Falta registrar a decisão");
  });

  it("nas outras etapas, conta as pendências", () => {
    expect(stepPendingLabel("config", 2)).toBe("2 pendência(s)");
    expect(stepPendingLabel("indicators", 1)).toBe("1 pendência(s)");
  });

  it("sem pendência, e na etapa Resultado, não mostra rótulo", () => {
    expect(stepPendingLabel("decision", 0)).toBeNull();
    expect(stepPendingLabel("barriers", 0)).toBeNull();
    expect(stepPendingLabel("result", 3)).toBeNull();
  });
});

describe("Exclusão com desfazer", () => {
  const cases = [CASO_A, CONECTAHIT, SQUAD];

  it("remove o caso e guarda a posição para desfazer", () => {
    const r = removeCase(cases, CONECTAHIT.id);
    expect(r.next.map((c) => c.id)).toEqual([CASO_A.id, SQUAD.id]);
    expect(r.removed?.id).toBe(CONECTAHIT.id);
    expect(r.index).toBe(1);
  });

  it("desfazer devolve o caso à mesma posição", () => {
    const r = removeCase(cases, CONECTAHIT.id);
    const back = restoreCase(r.next, r.removed!, r.index);
    expect(back.map((c) => c.id)).toEqual(cases.map((c) => c.id));
  });

  it("id inexistente não altera a lista", () => {
    const r = removeCase(cases, "nao-existe");
    expect(r.next).toEqual(cases);
    expect(r.removed).toBeNull();
  });

  it("desfazer não duplica um caso que já voltou", () => {
    const r = removeCase(cases, SQUAD.id);
    const once = restoreCase(r.next, r.removed!, r.index);
    expect(restoreCase(once, r.removed!, r.index)).toHaveLength(3);
  });
});
