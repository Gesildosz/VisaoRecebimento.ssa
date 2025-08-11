// Integração com Neon usando @neondatabase/serverless
// Recomendado para apps serverless no Vercel. [^vercel_knowledge_base]
import { neon } from "@neondatabase/serverless"

const connectionString = process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error("POSTGRES_URL não definida. Configure a variável de ambiente para conectar ao banco Neon.")
}

// Template tag `sql` (e também função) para executar queries.
export const sql = neon(connectionString)
