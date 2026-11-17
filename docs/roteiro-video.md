# Roteiro para apresentação em vídeo

Roteiro de até 10 minutos conforme a proposta do curso. Grave a tela e explique com suas palavras.

## 1 minuto — Problema e escopo

"Meu nome é Luan do Amparo Pereira. Este é meu Projeto B, feito individualmente. Criei uma API simples para gerenciar tarefas. O fluxo principal permite cadastrar uma tarefa, consultar a lista e marcá-la como concluída."

## 3 minutos — Demonstração

1. Mostre o `docker compose up --build` em execução e o log `API de tarefas pronta`.
2. Abra `/health` e mostre `status: ok`.
3. Crie uma tarefa pelo PowerShell com `Invoke-RestMethod`.
4. Abra `/tasks` e mostre a tarefa criada.
5. Marque-a como concluída com `PATCH /tasks/{id}/complete`, usando o ID retornado na criação, e atualize `/tasks` para mostrar `done: true`.

Para a gravação, abra outro PowerShell na pasta do projeto e execute uma linha por vez:

```powershell
$tarefaVideo = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/tasks" -ContentType "application/json" -Body '{"title":"Demonstrar o Projeto B"}'
$tarefaVideo
Invoke-RestMethod -Uri "http://localhost:3000/tasks"
Invoke-RestMethod -Method Patch -Uri "http://localhost:3000/tasks/$($tarefaVideo.id)/complete"
Invoke-RestMethod -Uri "http://localhost:3000/tasks"
```

## 3 minutos — Decisão técnica

Abra `docs/adr/0001-decisao.md`. Explique que escolheu PostgreSQL para persistir as tarefas entre reinícios e separou a regra de domínio da persistência com um repositório. A alternativa em memória foi descartada porque perderia os dados ao reiniciar.

## 3 minutos — Evidências e próximos passos

Mostre `npm run lint`, `npm run test:coverage` e o E2E conforme os comandos do README. Os resultados verificados foram 33 testes unitários/de integração, 3 E2E e 100% de cobertura do domínio. Explique que essa cobertura não inclui a aplicação inteira.

Mostre `docs/desempenho.md`: smoke de 10 segundos, 1 usuário virtual, 98 requisições, 0% de falhas e p95 de 2,27 ms em `/tasks`. O SLO foi atendido nessa amostra local com 1 tarefa no banco; isso não comprova o desempenho em produção. Termine explicando que adicionaria paginação e repetiria a medição com mais dados e usuários.

Mostre uma execução verde do CI se o bloqueio da conta já tiver sido resolvido. Se ainda houver bloqueio, explique o estado real e apresente os resultados locais, sem chamar o CI de aprovado.

## Antes de enviar

- Confirme que o vídeo e o link do repositório correspondem à versão final.
- Mostre apenas números que você realmente mediu.
- Verifique no Moodle o formato e o prazo de envio aceitos.
