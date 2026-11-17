# Projeto B — API de tarefas

**Nível escolhido: Projeto B.** API de domínio único para cadastrar, listar e concluir tarefas.

**Formato:** projeto individual. Apresentação: vídeo enviado pelo Moodle.

## Subir no primeiro dia

Requisitos: Docker Desktop e Node.js 22+ (para executar lint e testes localmente).

```bash
docker compose up --build
```

A API estará em `http://localhost:3000`. O banco PostgreSQL é inicializado pelo Compose.

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Estudar"}'
curl http://localhost:3000/tasks
```

## Como testar

```bash
npm install
npm run lint
npm run test:coverage
```

Smoke test k6 (com a aplicação no ar): `npm run smoke`.

## Decisões e evidências

- Decisão de arquitetura: [ADR 0001](docs/adr/0001-decisao.md)
- Contrato: [OpenAPI](docs/openapi.yaml)
- Medição e SLO: [desempenho](docs/desempenho.md)
- Contribuições: [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Roteiro para apresentação em vídeo: [docs/roteiro-video.md](docs/roteiro-video.md)

O CI executa instalação, lint e testes com coverage. O limite de cobertura declarado para o domínio é 70%.
