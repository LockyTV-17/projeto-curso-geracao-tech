# Roteiro para apresentação em vídeo

Roteiro de até 10 minutos conforme a proposta do curso. Grave a tela e explique com suas palavras.

## 1 minuto — Problema e escopo

"Meu nome é Luan do Amparo Pereira. Este é meu Projeto B, feito individualmente. Criei uma API simples para gerenciar tarefas. O fluxo principal permite cadastrar uma tarefa, consultar a lista e marcá-la como concluída."

## 3 minutos — Demonstração

1. Mostre o `docker compose up --build` em execução e o log `API de tarefas pronta`.
2. Abra `/health` e mostre `status: ok`.
3. Crie uma tarefa pelo PowerShell com `Invoke-RestMethod`.
4. Abra `/tasks` e mostre a tarefa criada.
5. Marque-a como concluída com `PATCH /tasks/1/complete` e atualize `/tasks` para mostrar `done: true`.

## 3 minutos — Decisão técnica

Abra `docs/adr/0001-decisao.md`. Explique que escolheu PostgreSQL para persistir as tarefas entre reinícios e separou a regra de domínio da persistência com um repositório. A alternativa em memória foi descartada porque perderia os dados ao reiniciar.

## 3 minutos — Evidências e próximos passos

Mostre os resultados reais de `npm run lint`, `npm run test:coverage`, o CI e o smoke test k6, caso já tenham sido executados. Em `docs/desempenho.md`, informe o que foi medido e as condições do teste. Não apresente o SLO como comprovado se ainda não tiver medição suficiente. Termine dizendo o que melhoraria, como adicionar paginação à listagem ou repetir o teste k6 com mais usuários e duração.

## Antes de enviar

- Confirme que o vídeo e o link do repositório correspondem à versão final.
- Mostre apenas números que você realmente mediu.
- Verifique no Moodle o formato e o prazo de envio aceitos.
