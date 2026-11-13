import { z } from "zod";
import { areas } from "@/content/site";

export const areaOptions = [...areas.map((a) => a.name), "Outra área", "Ainda não sei"] as const;

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe o seu nome."),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Informe um telefone com DDD."),
  email: z.union([z.literal(""), z.email("E-mail inválido.")]),
  area: z.enum(areaOptions, "Escolha uma opção."),
  message: z.string().trim().max(1500, "Use até 1.500 caracteres."),
  /** Dia preferido para o retorno, AAAA-MM-DD. Opcional. */
  preferredDate: z.union([z.literal(""), z.iso.date()]).optional(),
  /** Origem do lead: utm_*, gclid, fbclid, referrer e pagina de entrada. */
  attribution: z.record(z.string(), z.string().max(500)).optional(),
  consent: z.literal(true, "É preciso autorizar o contato."),
  /** Honeypot: humanos deixam vazio. */
  company: z.string().max(0).optional(),
});

export type Lead = z.infer<typeof leadSchema>;
