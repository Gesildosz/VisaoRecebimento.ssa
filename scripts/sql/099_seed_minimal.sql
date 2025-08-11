-- Seed mínimo opcional (edite conforme necessário)
INSERT INTO vehicle_types (name)
SELECT x.name FROM (VALUES ('Caminhão 3/4'), ('Carreta'), ('VUC')) AS x(name)
WHERE NOT EXISTS (SELECT 1 FROM vehicle_types);

INSERT INTO occurrence_types (name, severity)
SELECT x.name, x.severity FROM (VALUES ('Atraso', 2), ('Temperatura fora do limite', 5), ('Documentação', 3)) AS x(name, severity)
WHERE NOT EXISTS (SELECT 1 FROM occurrence_types);

-- Código de acesso de exemplo (NÃO use em produção): desative em produção ou substitua por UI/Admin
-- INSERT INTO access_codes (code, owner, role, active)
-- VALUES ('123456', 'Exemplo', 'viewer', TRUE)
-- ON CONFLICT (code) DO NOTHING;
