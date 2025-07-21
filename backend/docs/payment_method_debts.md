Orientação para Integração de Formas de Pagamento no Frontend
1. Cadastro e Gerenciamento de Formas de Pagamento
Endpoints Disponíveis
Listar formas de pagamento
GET /finance/payment-methods/
Criar nova forma de pagamento
POST /finance/payment-methods/
Body: { "name": "Pix", "description": "Pagamento instantâneo" }
Editar forma de pagamento
PUT /finance/payment-methods/{payment_method_id}
Body: { "name": "Cartão de Crédito", "description": "Qualquer cartão de crédito" }
Excluir forma de pagamento
DELETE /finance/payment-methods/{payment_method_id}
Exemplo de Objeto de Forma de Pagamento
{
  "id": "uuid",
  "name": "Cartão de Crédito",
  "description": "Qualquer cartão de crédito"
}
2. Uso em Transações
Criação e Edição de Transações
Campo obrigatório:
Para transações do tipo despesa (type: "expense"), o campo payment_method_id é obrigatório.
Para transações do tipo receita (type: "income"), o campo pode ser omitido ou nulo.
Como obter as opções:
Antes de criar ou editar uma transação, busque as opções disponíveis via GET /finance/payment-methods/ e apresente ao usuário (ex: dropdown).
Exemplo de payload para criar uma transação de despesa:
{
  "description": "Supermercado",
  "amount": 150.00,
  "type": "expense",
  "category": "alimentacao",
  "date": "2024-06-01",
  "payment_method_id": "uuid-do-pix"
}
Exemplo de payload para criar uma transação de receita:
{
  "description": "Salário",
  "amount": 3000.00,
  "type": "income",
  "category": "salario",
  "date": "2024-06-01"
  // payment_method_id pode ser omitido
}
3. Uso em Dívidas
O campo payment_method_id é opcional em dívidas.
Se informado, deve ser um ID válido de forma de pagamento.
4. Validação no Frontend
Para despesas:
Garanta que o usuário selecione uma forma de pagamento antes de enviar o formulário.
Para receitas:
O campo pode ser ocultado ou desabilitado.
Para dívidas:
O campo pode ser opcional.
5. Exibição
Ao exibir transações ou dívidas, busque o nome da forma de pagamento pelo payment_method_id (pode ser feito via cache local ou nova requisição ao endpoint de formas de pagamento).
6. Fluxo sugerido
Buscar formas de pagamento ao carregar telas de cadastro/edição de transações/dívidas.
Exibir as opções em um select/dropdown.
Validar obrigatoriedade conforme o tipo de transação.
Enviar o payment_method_id no payload ao criar/editar.
Exibir o nome da forma de pagamento nas listagens e detalhes.

Sim, a feature de forma de pagamento (payment_method) foi aplicada para as dívidas (debts). Veja como ficou:
Backend
Modelo:
O campo payment_method_id foi adicionado à tabela/modelo de debts como uma coluna opcional, referenciando a tabela payment_methods.
DTOs:
O campo payment_method_id foi incluído nos DTOs de criação, atualização e resposta de dívida (DebtCreateDTO, DebtUpdateDTO, DebtDTO).
Ele é opcional para dívidas.
Repositório:
O campo é salvo e atualizado normalmente ao criar ou editar uma dívida.
Endpoints:
Os endpoints de criação, atualização e listagem de dívidas aceitam e retornam o campo payment_method_id.
Documentação:
A documentação da API foi atualizada para indicar que o campo é opcional em dívidas.
Exemplo de payload para criar uma dívida com forma de pagamento:

{
  "description": "Empréstimo para amigo",
  "amount": 500.00,
  "date": "2024-06-01",
  "person_id": "uuid-da-pessoa",
  "payment_method_id": "uuid-do-cartao" // opcional
}

Resumindo:
O campo está disponível e funcional para dívidas.
Não é obrigatório, mas pode ser informado e será salvo/retornado pela API.