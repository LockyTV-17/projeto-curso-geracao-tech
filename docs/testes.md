# Relatório de testes

Execução inicial em 16/11/2026 e revalidação em 17/11/2026 (horário de São Paulo), após atualização para Vitest e coverage-v8 5.1.0. Objetivo: verificar regras, integração HTTP/domínio e o fluxo completo com PostgreSQL.

## Resultados

| Verificação | Resultado |
|---|---|
| `npm run lint` | Aprovado, sem erros |
| `npm run test:coverage` | 33 testes aprovados em 4 arquivos |
| Cobertura do domínio | 100% em linhas, funções, branches e statements |
| E2E com Docker Compose | 3 testes aprovados, contêiner de testes encerrou com código 0 |
| Auditoria npm após atualização das dependências | 0 vulnerabilidades reportadas |

O limite mínimo de cobertura é 70% em cada indicador, aplicado pelo Vitest. A coleta abrange somente `src/domain/**/*.js`, não o servidor HTTP nem a infraestrutura. Os testes E2E executam separadamente e não entram nesse percentual.

## Testes de borda

`tests/task-boundaries.test.js` verifica:

- Títulos ausentes, nulos, numéricos, booleanos, objetos, arrays, vazios e compostos apenas por espaços ou quebras de linha.
- Aceitação dos limites de 1 e 200 caracteres; rejeição de 201 caracteres antes da persistência.
- Remoção dos espaços externos antes de validar o tamanho.
- Listagem sem tarefas e retorno da tarefa concluída.

`tests/app-integration.test.js` usa o serviço de domínio real com um repositório em memória. Verifica:

- Criação, listagem e conclusão pela camada HTTP, incluindo normalização do título.
- Repetir uma conclusão mantém `done: true`.
- Requisições inválidas retornam 400 e não criam tarefas.
- IDs alfabéticos, zero, negativos, fracionários e acima do limite inteiro seguro do JavaScript retornam 400.
- Tarefa inexistente retorna 404 e JSON malformado retorna 400.

A validação da rota de conclusão passou a usar `Number.isSafeInteger` para impedir a conversão imprecisa de identificadores muito grandes.

## Testes de ponta a ponta

`tests/e2e/tasks.test.js` inicia a aplicação Express com o serviço e repositório PostgreSQL reais, escutando em uma porta HTTP atribuída pelo sistema. As requisições usam `fetch` pela rede. O banco PostgreSQL 16 é iniciado pelo Compose de testes com o mesmo esquema SQL da aplicação.

Os três cenários verificam:

1. Saúde da API; criar uma tarefa, listar e concluir duas vezes; confirmar título e conclusão diretamente por SQL.
2. Aceitar 200 caracteres, rejeitar 201 e confirmar que a tentativa inválida não aumentou o número de registros.
3. Confirmar que um ID não existe no banco e obter 404 ao tentar concluí-lo.

O banco é `tarefas_test`, isolado, sem porta publicada. A suíte recusa uma URL de banco com outro nome e remove apenas os IDs que criou. O comando de encerramento remove somente os recursos do projeto Docker `geracaotech-e2e`.

## Como reproduzir

Na raiz do repositório, com Node.js 22.12+ ou 24:

```powershell
npm ci
npm run lint
npm run test:coverage
```

Com Docker Desktop ativo, executar o E2E (não exige a API principal rodando):

```powershell
docker compose -p geracaotech-e2e -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from tests
docker compose -p geracaotech-e2e -f docker-compose.test.yml down -v
```

O primeiro comando retorna o código de saída dos testes. Para usar `npm run test:e2e` diretamente, é necessário fornecer `TEST_DATABASE_URL` apontando para um PostgreSQL com banco `tarefas_test` e tabela inicializada com `src/infra/schema.sql`.

## Limites e CI

O E2E verifica o fluxo da API e a persistência real; não mede carga, reinícios, migrações ou recuperação de falhas. A regra atual de tamanho de título usa o comprimento da string JavaScript; os testes de limite usam caracteres ASCII.

O workflow `.github/workflows/ci.yml` foi atualizado para executar o E2E após lint e testes com cobertura, com encerramento do ambiente em etapa `always()`. Isso foi validado localmente. Ainda não há confirmação dessa versão no GitHub Actions; a consulta anterior ao serviço indicou bloqueio de execução por cobrança na conta.

O smoke test k6 e seu p95 estão documentados separadamente em `docs/desempenho.md`.
