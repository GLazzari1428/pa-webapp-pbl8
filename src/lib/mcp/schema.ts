import { z } from "zod";
import { DIMENSIONS } from "../engine/types";

const dim = z.enum(DIMENSIONS);
const num = z.number().nullable();

export const indicatorSchema = z.object({
  id: z.string(),
  dimension: dim,
  name: z.string(),
  kpiType: z.enum(["antecedente", "resultado"]),
  direction: z.enum(["maior", "menor"]),
  unit: z.enum(["percentual", "moeda", "minutos", "horas", "dias", "pontos", "unidade", "outra"]),
  customUnit: z.string().optional(),
  baseline: num,
  target: num,
  observed: num,
  weight: num,
  evidenceSource: z.string(),
  evidencePeriod: z.string(),
  evidenceOwner: z.string(),
  binaryCriterion: z.string().optional(),
  binaryMet: z.boolean().nullable().optional(),
});

export const barrierSchema = z.object({
  id: z.string(),
  name: z.string(),
  criterion: z.string(),
  status: z.enum(["atendida", "em_tratamento", "violada", "nao_avaliada"]),
  evidence: z.string(),
  plan: z.string(),
  planApproved: z.boolean(),
  owner: z.string(),
});

export const configSchema = z.object({
  name: z.string(),
  context: z.string(),
  dataType: z.enum(["real", "referencia", "simulado"]),
  period: z.string(),
  owners: z.string(),
  hypothesis: z.object({ text: z.string(), indicatorId: z.string().nullable(), target: num }),
  weights: z.object({ tecnica: z.number(), economica: z.number(), operacional: z.number(), governanca: z.number() }),
  thresholds: z.object({ lower: z.number(), scale: z.number(), border: z.number(), variation: z.number() }),
  correctableLoss: z.enum(["sim", "nao"]).nullable(),
  correctableDimension: dim.nullable(),
  correctableRationale: z.string(),
});

export const caseInputSchema = z.object({
  config: configSchema,
  indicators: z.array(indicatorSchema),
  barriers: z.array(barrierSchema),
});
