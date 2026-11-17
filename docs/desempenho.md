# Desempenho e operação

## Plano e medição

Executado localmente com Docker Compose ativo, usando k6 em contêiner e o script `tests/smoke.js`. O script fez uma chamada ao endpoint `/health`.

Resultado observado: 1 requisição, check `health responde 200` aprovado, 0% de falhas, duração média de 13,3 ms e p95 de 13,3 ms. Como foi apenas uma iteração, esta medição confirma o smoke test, mas não é um benchmark representativo nem comprova o SLO sob carga.

Para uma medição representativa, aumentar duração e usuários virtuais e registrar a nova saída do terminal aqui.

## SLO

Objetivo inicial: 95% das respostas do fluxo de leitura concluídas em até 300 ms, medido em execução local com carga definida. Esse alvo ainda precisa ser validado com uma amostra maior antes da apresentação.

## Observabilidade

Pino registra método, rota, status e duração de cada resposta em JSON. `/metrics` publica a métrica simples `api_up 1`.

## Gargalo e próximos passos

Não há benchmark suficiente para afirmar um gargalo. Sob carga, medir p95 e consultar `EXPLAIN ANALYZE` para a listagem; adicionar índice ou paginação apenas se os dados justificarem.
