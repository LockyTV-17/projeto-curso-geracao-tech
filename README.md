# Nível escolhido: Projeto B — Projeto Curso Geração Tech (API de tarefas)

Projeto individual desenvolvido para o curso **Geração Tech**. A aplicação é uma API de domínio único para organizar tarefas, feita para demonstrar um fluxo funcional de ponta a ponta.

## O que a API faz

- Cria uma tarefa com título.
- Lista as tarefas cadastradas.
- Marca uma tarefa como concluída.
- Verifica a saúde da API.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Verifica se a API está respondendo |
| `GET` | `/tasks` | Lista as tarefas |
| `POST` | `/tasks` | Cria uma tarefa; requer `{"title":"Estudar"}` |
| `PATCH` | `/tasks/{id}/complete` | Marca a tarefa indicada como concluída |
| `GET` | `/metrics` | Retorna a métrica simples `api_up` |

O contrato das rotas está em [`docs/openapi.yaml`](docs/openapi.yaml).

## Tecnologias e estrutura

- Node.js, Express e PostgreSQL.
- Docker Compose inicia a API e o banco de dados.
- O serviço de domínio valida as regras e usa um repositório para persistência.
- Pino registra logs estruturados em JSON.
- Vitest e Supertest cobrem regras do domínio e rotas da API.
- GitHub Actions executa instalação, lint e testes com cobertura.

```text
.
├── docker-compose.yml
├── Dockerfile
├── README.md
├── CONTRIBUTORS.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── domain/task-service.js
│   └── infra/
├── tests/
├── docs/
│   ├── adr/0001-decisao.md
│   ├── openapi.yaml
│   ├── desempenho.md
│   └── roteiro-video.md
└── .github/workflows/ci.yml
```

## Como iniciar

Requisito: Docker Desktop em execução. Para os testes locais, use Node.js 22.12+ ou 24 e npm. Na pasta do projeto, rode:

```powershell
docker compose up --build
```

Quando o log mostrar `API de tarefas pronta`, a aplicação está disponível em `http://localhost:3000`. Para encerrar, pressione `Ctrl+C` no terminal do Compose.

Exemplo para criar uma tarefa no PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/tasks" -ContentType "application/json" -Body '{"title":"Estudar para o projeto"}'
```

Abra `http://localhost:3000/tasks` para listar as tarefas. Para concluir a tarefa de ID 1:

```powershell
Invoke-RestMethod -Method Patch -Uri "http://localhost:3000/tasks/1/complete"
```

## Como verificar

Para instalar as dependências de desenvolvimento e executar localmente no PowerShell:

```powershell
npm install
npm run lint
npm run test:coverage
```

Resultados verificados: lint sem erros; 33 testes unitários e de integração passaram; cobertura de 100% do domínio (linhas, funções, branches e statements), acima do mínimo declarado de 70%. A cobertura está limitada a `src/domain/**/*.js` e não representa toda a aplicação.

Para executar os 3 testes de ponta a ponta com HTTP e PostgreSQL reais em um ambiente isolado, use:

```powershell
docker compose -p geracaotech-e2e -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from tests
```

Ao terminar, remova somente o ambiente de testes:

```powershell
docker compose -p geracaotech-e2e -f docker-compose.test.yml down -v
```

Os 3 testes E2E passaram. O banco de testes não publica portas e é separado do banco da aplicação. Casos, resultados e limites da verificação estão em [`docs/testes.md`](docs/testes.md). O workflow do CI também foi configurado para executar o E2E; a execução remota ainda depende da resolução do bloqueio da conta no GitHub.

O smoke test k6 executa por 10 segundos com 1 usuário virtual, verificando `/health` e `/tasks`, com pausa de 200 ms entre iterações. Com o Docker Compose ainda ativo, execute:

```powershell
docker run --rm -v "$($PWD.Path):/scripts" -w /scripts grafana/k6 run -e BASE_URL=http://host.docker.internal:3000 tests/smoke.js
```

Último resultado observado: 98 requisições, 147 verificações aprovadas, 0% de falhas e p95 de 2,27 ms para `/tasks`. O script reprova se houver falha HTTP, check inválido ou p95 de leitura acima do limite configurado de 300 ms. Consulte as condições e o resumo bruto em [`docs/desempenho.md`](docs/desempenho.md) e [`docs/k6-summary.json`](docs/k6-summary.json).

## Arquitetura, operação e desempenho

- A decisão de usar PostgreSQL e separar domínio e persistência está registrada em [`docs/adr/0001-decisao.md`](docs/adr/0001-decisao.md); a alternativa em memória foi descartada.
- O SLO inicial é responder 95% das leituras em até 300 ms na janela de medição local. Ele foi atendido no smoke test descrito em [`docs/desempenho.md`](docs/desempenho.md); cargas maiores e produção exigem nova validação.
- Os logs estruturados registram método, rota, status e duração da requisição. A rota `/metrics` expõe a métrica simples `api_up 1`.
- As variáveis de ambiente de exemplo estão em [`.env.example`](.env.example). Não coloque credenciais reais no repositório.

## Entrega e apresentação

- Formato: individual. O contribuidor está registrado em [`CONTRIBUTORS.md`](CONTRIBUTORS.md).
- Repositório: [LockyTV-17/projeto-curso-geracao-tech](https://github.com/LockyTV-17/projeto-curso-geracao-tech).
- CI: [execuções do GitHub Actions](https://github.com/LockyTV-17/projeto-curso-geracao-tech/actions). A última execução consultada foi bloqueada por cobrança na conta; ainda falta obter e entregar o link de uma execução aprovada.
- Apresentação: vídeo para envio pelo Moodle; consulte [`docs/roteiro-video.md`](docs/roteiro-video.md).
- Entrega: enviar pelo Moodle o link do repositório, este README, `docs/desempenho.md` e `CONTRIBUTORS.md`, conforme as instruções da atividade.

As credenciais `tarefas` do Compose são exemplos para o ambiente local didático. Não reutilize esses valores em um ambiente público. `.env` está ignorado pelo Git; `.env.example` contém apenas exemplos. O Compose já fornece as variáveis necessárias à API, sem exigir configuração manual para a demonstração.
