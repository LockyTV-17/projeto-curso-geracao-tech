# Desempenho e operação

## Plano e medição

Última execução: 17/11/2026, localmente em Windows com Docker Desktop, API Node.js 22 e PostgreSQL 16 no Docker Compose. O k6 executou em contêiner contra `host.docker.internal:3000`. O banco tinha 1 tarefa durante a medição.

Carga: 1 usuário virtual por 10 segundos, GET `/health` e GET `/tasks` por iteração, com pausa de 200 ms. Nenhuma gravação é feita pelo script.

| Indicador | Resultado |
|---|---|
| Iterações | 49 |
| Requisições | 98 (49 por endpoint) |
| Checks | 147 aprovados, nenhuma falha |
| Falhas HTTP | 0% |
| p95 geral | 2,20 ms (arredondado) |
| p95 de GET `/tasks` | 2,27 ms (arredondado) |
| Média de GET `/tasks` | 2,03 ms (arredondado) |

O resumo bruto está em [`k6-summary.json`](k6-summary.json). Os limites `checks: rate==1`, `http_req_failed: rate==0` e p95 de `/tasks` abaixo de 300 ms passaram; k6 encerrou com código 0.

Com a API ativa, reproduzir da raiz do projeto no PowerShell:

```powershell
docker run --rm -v "$($PWD.Path):/scripts:ro" -v "$($PWD.Path)/docs:/results" -w /scripts grafana/k6 run --summary-export /results/k6-summary.json -e BASE_URL=http://host.docker.internal:3000 tests/smoke.js
```

Uma execução inicial anterior fez apenas 1 chamada a `/health`, com p95 de 13,3 ms. Como o cenário mudou, ela não serve como comparação de melhoria de desempenho.

## SLO

Objetivo inicial: 95% das respostas de GET `/tasks` concluídas em até 300 ms, na janela de execução local definida acima. O alvo foi atendido nesta amostra. O limite automatizado é estrito (`p(95)<300`). O resultado não garante esse desempenho com muitos usuários, maior volume de dados ou em produção.

## Observabilidade

Pino registra método, rota, status e duração de cada resposta em JSON. `/metrics` publica a métrica simples `api_up 1`.

## Gargalo e próximos passos

Não há benchmark suficiente para afirmar um gargalo. Sob carga, medir p95 e consultar `EXPLAIN ANALYZE` para a listagem; adicionar índice ou paginação apenas se os dados justificarem.
