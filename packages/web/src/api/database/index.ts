import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Pooler do Supabase em modo sessão (porta 5432). O modo transação (6543)
 * trava quando o postgres-js enfileira várias consultas na mesma conexão
 * (pedidos simultâneos): o Supavisor fica esperando o cliente e tudo para.
 * A URL do ambiente pode continuar apontando para a 6543; a troca é feita aqui.
 * idle_timeout curto devolve a conexão ao pool quando a função fica parada.
 */
const url = process.env.DATABASE_URL!.replace(/(pooler\.supabase\.com):6543\//, "$1:5432/");
const client = postgres(url, { prepare: false, max: 1, idle_timeout: 20 });

export const db = drizzle(client, { schema });
