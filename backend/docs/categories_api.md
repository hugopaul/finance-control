# API de Categorias

## Regras de Negócio

- **Identificador (`id`)**: Deve ser único (string). Definido pelo cliente na criação.
- **Nome (`name`)**: Obrigatório. String representando o nome da categoria.
- **Ícone (`icon`)**: Opcional. String curta (ex: emoji ou nome de ícone).
- **Cor (`color`)**: Opcional. String hexadecimal (ex: `#FF0000`).
- **Data de criação (`created_at`)**: Definida automaticamente pelo sistema.
- **Imutabilidade do ID**: O campo `id` não pode ser alterado após a criação.
- **Remoção**: Só pode ser removida se não houver dependências (regra pode ser expandida).

---

## Endpoints Disponíveis

### 1. Listar Categorias
- **GET `/config/categories`**
- **Descrição**: Retorna todas as categorias cadastradas.
- **Resposta:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "alimentacao",
        "name": "Alimentação",
        "icon": "🍔",
        "color": "#FF5733",
        "created_at": "2024-07-20T16:30:24.686Z"
      }
    ]
  }
}
```

### 2. Criar Categoria
- **POST `/config/categories`**
- **Descrição**: Cria uma nova categoria.
- **Body:**
```json
{
  "id": "transporte",
  "name": "Transporte",
  "icon": "🚗",
  "color": "#4287f5"
}
```
- **Resposta:**
```json
{
  "success": true,
  "message": "Categoria criada com sucesso",
  "data": {
    "category": {
      "id": "transporte",
      "name": "Transporte",
      "icon": "🚗",
      "color": "#4287f5",
      "created_at": "2024-07-20T16:31:00.000Z"
    }
  }
}
```

### 3. Atualizar Categoria
- **PUT `/config/categories/{category_id}`**
- **Descrição**: Atualiza parcialmente ou totalmente uma categoria existente.
- **Body (exemplo):**
```json
{
  "name": "Transporte Público",
  "icon": "🚌"
}
```
- **Resposta:**
```json
{
  "success": true,
  "message": "Categoria atualizada com sucesso",
  "data": {
    "category": {
      "id": "transporte",
      "name": "Transporte Público",
      "icon": "🚌",
      "color": "#4287f5",
      "created_at": "2024-07-20T16:31:00.000Z"
    }
  }
}
```
- **Obs:** O campo `id` não pode ser alterado.

### 4. Remover Categoria
- **DELETE `/config/categories/{category_id}`**
- **Descrição**: Remove uma categoria pelo seu ID.
- **Resposta (sucesso):**
```json
{
  "success": true,
  "message": "Categoria removida com sucesso"
}
```
- **Resposta (erro):**
```json
{
  "success": false,
  "message": "Categoria não encontrada"
}
```

---

## Padrão de Resposta

Todos os endpoints retornam:
- `success`: booleano indicando sucesso ou falha.
- `message`: mensagem amigável.
- `data`: objeto com os dados retornados (quando aplicável).

---

## Dicas de Utilização

- Use o campo `id` como chave única para cada categoria.
- Para atualizar, envie apenas os campos que deseja modificar.
- Para remover, basta informar o `id` na URL.
- Utilize ferramentas como Swagger UI (`/docs`), Postman ou Insomnia para testar os endpoints. 