# ADR 0001: API única com PostgreSQL

- Status: Aceita
- Data: 2026-11-16

## Contexto

O projeto precisa demonstrar um fluxo de domínio funcional com persistência, mantendo baixo o custo de execução e explicação.

## Decisão

Implementar uma API Express de tarefas com PostgreSQL e separar regras de domínio da persistência por um repositório injetado no serviço. O Compose sobe API e banco em um comando.

## Alternativa descartada

Armazenamento em memória foi descartado porque perde tarefas ao reiniciar o processo e não demonstra persistência.

## Consequências

Há dependência do PostgreSQL, mas o ambiente local fica reproduzível pelo Docker Compose. O serviço de domínio pode ser testado isoladamente com repositório simulado.
