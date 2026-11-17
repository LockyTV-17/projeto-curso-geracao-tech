# ADR 0001: API única com PostgreSQL

- Status: Aceita
- Data: 2026-11-16

## Contexto

O projeto precisa demonstrar um fluxo de domínio funcional com persistência, mantendo baixo o custo de execução e explicação.

## Decisão

Implementar uma API Express de tarefas com PostgreSQL e separar regras de domínio da persistência por um repositório injetado no serviço. O Compose sobe API e banco em um comando.

## Alternativa descartada

Armazenamento em memória foi descartado porque perde tarefas ao reiniciar o processo e não demonstra persistência.

## Padrão e princípios de design

O padrão **Repository** concentra as consultas SQL em `src/infra/postgres-task-repository.js`. O serviço recebe esse repositório por parâmetro e usa as operações `create`, `list` e `complete`. Isso permite testar as regras com um repositório em memória e usar PostgreSQL na aplicação sem alterar as regras.

Aplicações concretas de SOLID:

- Responsabilidade única: as rotas tratam HTTP, o serviço valida o domínio e o repositório trata SQL.
- Inversão de dependência: o serviço recebe um contrato de repositório por injeção, sem importar PostgreSQL.
- Segregação de interfaces: o serviço depende apenas das três operações de persistência de que precisa.

A alternativa de colocar SQL nas rotas foi descartada por acoplar transporte e persistência e dificultar os testes isolados. Para este domínio pequeno, o custo do Repository é apenas uma função adicional e um contrato simples entre as camadas.

## Consequências

Há dependência do PostgreSQL, mas o ambiente local fica reproduzível pelo Docker Compose. O serviço de domínio pode ser testado isoladamente com repositório simulado.
