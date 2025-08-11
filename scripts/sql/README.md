# Como inicializar o banco no Neon (Postgres)

Este app usa Neon via driver serverless para persistir os códigos de acesso.

## Tabela necessária

A API cria automaticamente a tabela principal na primeira chamada:
- access_codes (id, code, owner, role, active, created_at)

Se preferir, você pode criar manualmente executando o SQL abaixo:

\`\`\`sql
CREATE TABLE IF NOT EXISTS access_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  owner TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin','manager','viewer')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_access_codes_active ON access_codes (active) WHERE active = TRUE;
\`\`\`

## Testes rápidos

1. Cadastrar um código
\`\`\`bash
curl -X POST /api/access-codes \
  -H "Content-Type: application/json" \
  -d '{"code":"123456","owner":"Fulano","role":"manager"}'
\`\`\`

2. Validar código
\`\`\`bash
curl -X POST /api/access/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'
\`\`\`
Resposta esperada:
\`\`\`json
{ "ok": true, "role": "manager", "owner": "Fulano" }
\`\`\`

3. Validar código sem perfil
- Se o código não tiver role, a API retorna ok com role "viewer" por padrão.

## Variáveis de ambiente

- POSTGRES_URL: URL do seu banco no Neon.
- MASTER_ADMIN_CODE (opcional): código master (padrão "347568" se não setado). Não é exibido no UI.
