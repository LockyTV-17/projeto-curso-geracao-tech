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

Requisito: Docker Desktop em execução. Na pasta do projeto, rode:

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

Resultados já observados localmente: lint sem erros; 6 testes passaram; cobertura de 90,47%, acima do mínimo declarado de 70%.

O smoke test k6 faz uma requisição ao endpoint `/health`. Com o Docker Compose ainda ativo, ele pode ser executado em um contêiner Docker:

```powershell
docker run --rm -v "$($PWD.Path):/scripts" -w /scripts grafana/k6 run -e BASE_URL=http://host.docker.internal:3000 tests/smoke.js
```

Resultado observado: 1 requisição, check de saúde aprovado, 0% de falhas e p95 de 13,3 ms. Como foi uma única iteração, esse resultado confirma apenas o smoke test; não é um benchmark representativo.

## Arquitetura, operação e desempenho

- A decisão de usar PostgreSQL e separar domínio e persistência está registrada em [`docs/adr/0001-decisao.md`](docs/adr/0001-decisao.md); a alternativa em memória foi descartada.
- O plano de medição, SLO e resultado do smoke test estão em [`docs/desempenho.md`](docs/desempenho.md). O SLO inicial é p95 de até 300 ms para leitura; ainda precisa ser avaliado com uma amostra de carga maior.
- Os logs estruturados registram método, rota, status e duração da requisição. A rota `/metrics` expõe a métrica simples `api_up 1`.
- As variáveis de ambiente de exemplo estão em [`.env.example`](.env.example). Não coloque credenciais reais no repositório.

## Entrega e apresentação

- Formato: individual. O contribuidor está registrado em [`CONTRIBUTORS.md`](CONTRIBUTORS.md).
- Repositório: publicar este projeto e inserir aqui o link da execução verde do CI antes de enviar a atividade.
- Apresentação: vídeo para envio pelo Moodle; consulte [`docs/roteiro-video.md`](docs/roteiro-video.md).
- Entrega: enviar pelo Moodle o link do repositório, este README, `docs/desempenho.md` e `CONTRIBUTORS.md`, conforme as instruções da atividade.
