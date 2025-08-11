# Configurar MASTER_ADMIN_CODE

Use a variável de ambiente MASTER_ADMIN_CODE para definir o código mestre de administrador (sem mostrar na interface). A API lê esse valor no servidor via `process.env.MASTER_ADMIN_CODE`.

Opções de configuração:

1) Vercel (recomendado)
- Vá até o Dashboard do seu projeto no Vercel > Settings > Environment Variables.
- Clique em "Add".
  - Name: MASTER_ADMIN_CODE
  - Value: o código desejado (por exemplo, 347568)
  - Environment: selecione onde aplicar (Production, Preview, Development).
- Salve e faça um novo deploy para que o valor esteja disponível nas rotas de API. [^vercel_knowledge_base]

2) Desenvolvimento local (Next.js padrão)
- Crie um arquivo `.env.local` na raiz do projeto e adicione:
  MASTER_ADMIN_CODE=347568
- Reinicie o servidor de desenvolvimento.

Observação importante para o preview do v0 (Next.js):
- Arquivos .env não são suportados no preview do v0. Use variáveis de ambiente do Vercel para que as rotas server-side leiam o valor corretamente no servidor.

Como o código usa a variável:
- A rota `app/api/access/validate/route.ts` lê a variável no servidor:
  \`\`\`ts
  const MASTER_ADMIN_CODE = process.env.MASTER_ADMIN_CODE || "347568"
  \`\`\`
- Se você definir a variável no Vercel, ela irá sobrescrever o fallback.

Checklist de validação:
- Após definir a variável, faça um novo deploy.
- Teste a rota:
  curl -X POST /api/access/validate -H "Content-Type: application/json" -d '{"code":"SEU_CODIGO"}'
- A resposta deve retornar { ok: true, role: "admin", ... } quando o código for o MASTER_ADMIN_CODE.

Dicas:
- Guarde esse valor em local seguro e troque periodicamente.
- Evite expor o valor do MASTER_ADMIN_CODE na interface.
- Para outros códigos com dono/perfil, use o painel Admin (persistidos no Neon).

[^vercel_knowledge_base]
