# Requisitos funcionais

## RF01 — Autenticação de Usuário

### Descrição

O usuário deve conseguir criar uma conta e acessar a aplicação com suas credenciais. Enquanto não autenticado, o acesso às demais telas deve ser bloqueado. A autenticação é o requisito base para todos os demais requisitos

### Detalhes Técnicos

- Telas de **Login** (`/login`) e **Cadastro** (`/register`) com formulários validados
- Após login bem-sucedido, redirecionar para `/`
- Implementar o componente `ProtectedRoute` via React Router para bloquear rotas privadas (descritas em outros requisitos)
- Armazenar `token` e dados do usuário em um slice do Redux
- Criar thunks `login` e `register` consumindo a API

### Critérios de Aceitação

- [ ] O usuário consegue criar uma conta com nome, email e senha
- [ ] O usuário consegue fazer login com email e senha válidos
- [ ] Credenciais inválidas exibem uma mensagem de erro clara
- [ ] Ao tentar acessar qualquer rota privada sem autenticação, o usuário é redirecionado para `/login`
- [ ] Após login, o usuário é redirecionado para a tela inicial

---

## RF02 — Registro de Transações

### Descrição

O usuário deve conseguir registrar suas receitas e despesas, informando o valor, tipo, categoria, data e uma descrição opcional. As transações registradas devem ser listadas em ordem cronológica.

### Detalhes Técnicos

- Telas de **listagem** (`/transactions`) e **criação** (`/transactions/new`) de transações
- Campos do formulário:
  - Valor;
  - Tipo (receita/despesa, ou pode derivar do valor digitado);
  - Categoria (alimentação, aluguel, parcelas...);
  - Data (padrão para o dia de hoje);
  - Descrição.
  - Tag (Opcional)
- Armazenar as `categorias` e a `lista de transações` em um slice do Redux.
  - Caso hajam muitas transações, implementar paginação (suportado pela API) ou scroll infinito para otimizar a performance, guarde no Redux apenas as transações da página atual.
- Criar thunks `fetchTransactions` e `createTransaction` consumindo a API

### Critérios de Aceitação

- [ ] O usuário consegue registrar uma transação preenchendo todos os campos obrigatórios
- [ ] A listagem exibe todas as transações do usuário com tipo, valor, categoria e data
- [ ] Não é possível submeter o formulário com campos obrigatórios vazios
- [ ] Após criar uma transação, o usuário é redirecionado para a listagem

---

## RF03 — Dashboard Financeiro

### Descrição

O usuário deve ter acesso a uma tela inicial com um resumo financeiro do mês atual, exibindo o saldo, o total de receitas, o total de despesas e as transações mais recentes.

### Detalhes Técnicos

- Tela principal na rota `/` protegida pelo `ProtectedRoute`
- Exibir: saldo atual, total de receitas e total de despesas do mês
- Listar as 5 transações mais recentes
- Utilizar **selectors derivados** sobre a `lista de transações` do Redux para calcular os valores — sem slice próprio para o dashboard

### Critérios de Aceitação

- [ ] A tela inicial exibe o saldo, total de receitas e total de despesas do mês corrente
- [ ] Os valores são recalculados automaticamente após o registro de uma nova transação
- [ ] As 5 transações mais recentes são listadas com tipo, valor e data
- [ ] Os dados exibidos estão sempre sincronizados com o estado do Redux

---

## RF04 - Definido pelo grupo (Etapa 1)

## RF05 — Cadastro de Metas Financeiras

### Descrição

O usuário deve conseguir registrar metas financeiras de poupança, definindo nome, valor-alvo, data-limite e categoria opcional. O progresso de cada meta é calculado automaticamente com base nas receitas registradas no período.

### Detalhes Técnicos

- Telas de **listagem** (`/goals`) e **criação** (`/goals/new`) de metas, protegidas pelo `ProtectedRoute`
- Campos do formulário:
  - Nome da meta;
  - Valor-alvo;
  - Data-limite;
  - Categoria (opcional).
- Armazenar as metas em um slice `goalsSlice` do Redux
- Criar thunks `fetchGoals` e `createGoal` consumindo a API (`GET /goals`, `POST /goals`)
- Selector derivado `selectGoalProgress(goalId)` calculando percentual atingido com base nas transações de receita do slice de transações — sem slice próprio para o progresso
- **Testes automatizados obrigatórios (Vitest + React Testing Library)**:
  - `goalsSlice.test.ts`: estado inicial, reducers e thunks (usar `msw` para mock de API)
  - `goalSelectors.test.ts`: selector com 3 cenários — sem receitas (0%), progresso parcial e meta atingida (100%)
  - `GoalsList.test.tsx` (ou relativo ao seu componente): renderização da listagem com metas de fixture
  - `GoalForm.test.tsx` (ou relativo ao seu componente): validação de campos obrigatórios e submissão bem-sucedida
- Script `npm test` configurado com Vitest no `package.json`

### Critérios de Aceitação

- [ ] O usuário consegue criar uma meta com nome, valor-alvo e data-limite
- [ ] A listagem exibe todas as metas com barra de progresso percentual atualizada
- [ ] Não é possível submeter o formulário com campos obrigatórios vazios
- [ ] O selector de progresso é coberto por testes com cenários de 0%, parcial e 100%
- [ ] `npm test` passa sem erros

---

## RF06 — Limites de Gastos

### Descrição

O usuário deve conseguir definir limites mensais de gastos por categoria. O sistema deve alertar quando o gasto do mês corrente em uma categoria se aproximar ou ultrapassar o limite definido, utilizando Service Workers para cache offline e notificações — mesmo com a aba em segundo plano.

### Detalhes Técnicos

- Tela de gerenciamento de limites (`/spending-limits`), protegida pelo `ProtectedRoute`
- Campos do formulário:
  - Categoria;
  - Valor-limite (mensal).
- Armazenar os limites em um slice `spendingLimitsSlice` do Redux
- Criar thunks `fetchSpendingLimits`, `createSpendingLimit` e `deleteSpendingLimit` consumindo a API
- Selector derivado `selectSpendingStatus`: cruza os limites com as transações do mês atual e retorna `{ categoryId, limitAmount, spent, percentUsed }[]` — sem slice próprio
- **Service Worker** (`public/sw.js`, registrado em `main.tsx` via `navigator.serviceWorker.register`):
  - Estratégia **cache-first** para `GET /categories` e `GET /spending-limits` (Cache API)
  - Estratégia **network-first com fallback** para `GET /transactions` (exibe dados cacheados quando offline)
  - **Notificação** via Web Notifications API: quando uma transação é criada com sucesso e `percentUsed ≥ 80%` na categoria, o Service Worker envia uma notificação ao usuário (solicitar permissão com `Notification.requestPermission()`)
  - Página de **offline fallback** exibida quando nenhum recurso em cache for encontrado
- Integração no formulário `/transactions/new`: ao preencher categoria e valor, verificar `spendingStatus` no Redux e exibir alerta inline se `percentUsed ≥ 100%`

### Critérios de Aceitação

- [ ] O usuário consegue definir um limite mensal por categoria
- [ ] A tela exibe o progresso de gastos vs. limite com indicação visual (verde / amarelo ≥ 80% / vermelho ≥ 100%)
- [ ] Uma Web Notification é exibida quando o gasto em uma categoria atinge 80% do limite ao criar uma transação
- [ ] A aplicação exibe dados cacheados (transações, limites e categorias) quando offline
- [ ] O formulário de nova transação exibe alerta inline quando a categoria selecionada já atingiu o limite

---

## RF07 - Definido pelo grupo (Etapa 2)

- Implementar como microfrontend
