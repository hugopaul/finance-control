# 🔄 Guia de Versionamento da API

## 📋 Visão Geral

Este guia estabelece as regras e processos para versionamento da API do sistema de controle financeiro. Todas as mudanças nos contratos da API devem seguir este processo.

## 🎯 Objetivos

- **Controle de Mudanças**: Rastrear todas as alterações na API
- **Compatibilidade**: Manter compatibilidade entre versões
- **Comunicação**: Informar mudanças à equipe e stakeholders
- **Documentação**: Manter documentação sempre atualizada

## 📊 Sistema de Versionamento

### Semantic Versioning (SemVer)
Usamos o padrão `MAJOR.MINOR.PATCH`:

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): Novas funcionalidades
- **PATCH** (1.0.0 → 1.0.1): Correções

### Regras de Incremento

#### MAJOR (Breaking Changes)
- ❌ Remoção de endpoints
- ❌ Mudança na estrutura de resposta
- ❌ Mudança obrigatória em campos existentes
- ❌ Mudança na autenticação
- ❌ Mudança no formato de dados

#### MINOR (Novas Funcionalidades)
- ✅ Adição de novos endpoints
- ✅ Novos campos opcionais
- ✅ Novos parâmetros opcionais
- ✅ Novos tipos de resposta
- ✅ Novas funcionalidades

#### PATCH (Correções)
- ✅ Correção de bugs
- ✅ Melhoria na documentação
- ✅ Correção de exemplos
- ✅ Correção de typos
- ✅ Melhorias de performance

## 🛠️ Processo de Versionamento

### 1. Identificar o Tipo de Mudança

#### Breaking Change (MAJOR)
```javascript
// ANTES
{
  "user": {
    "id": 1,
    "name": "João"
  }
}

// DEPOIS
{
  "user": {
    "id": "1",  // Mudança de tipo
    "name": "João",
    "email": "joao@example.com"  // Novo campo obrigatório
  }
}
```

#### Nova Funcionalidade (MINOR)
```javascript
// ANTES
{
  "transaction": {
    "id": "1",
    "amount": 100.00
  }
}

// DEPOIS
{
  "transaction": {
    "id": "1",
    "amount": 100.00,
    "category": "alimentacao",  // Novo campo opcional
    "tags": ["urgente"]         // Nova funcionalidade
  }
}
```

#### Correção (PATCH)
```javascript
// ANTES
{
  "error": "Invalid email format"
}

// DEPOIS
{
  "error": "Formato de email inválido"  // Correção de mensagem
}
```

### 2. Usar o Script de Versionamento

```bash
# Para breaking changes
node scripts/version-api.js major "Mudança na estrutura de resposta de usuários"

# Para novas funcionalidades
node scripts/version-api.js minor "Adicionado endpoint de notificações"

# Para correções
node scripts/version-api.js patch "Corrigido erro de validação de email"
```

### 3. Revisar e Testar

- ✅ **Revisar mudanças** nos arquivos atualizados
- ✅ **Testar compatibilidade** com frontend
- ✅ **Validar documentação** está correta
- ✅ **Comunicar mudanças** à equipe

## 📝 Arquivos de Versionamento

### 1. API_DOCUMENTATION.md
- **Propósito**: Documentação principal da API
- **Conteúdo**: Contratos, exemplos, validações
- **Atualização**: Automática via script

### 2. API_VERSION_CONTROL.md
- **Propósito**: Controle de versões e histórico
- **Conteúdo**: Histórico de mudanças, roadmap
- **Atualização**: Automática via script

### 3. CHANGELOG.md
- **Propósito**: Log detalhado de mudanças
- **Conteúdo**: Changelog no formato Keep a Changelog
- **Atualização**: Automática via script

## 🔍 Checklist de Compatibilidade

### Antes de Fazer Breaking Changes
- [ ] **Impacto no Frontend**: Verificar se o frontend será afetado
- [ ] **Plano de Migração**: Criar plano para usuários existentes
- [ ] **Aviso de Deprecação**: Avisar com antecedência
- [ ] **Compatibilidade Temporária**: Manter compatibilidade temporária
- [ ] **Documentação**: Atualizar documentação
- [ ] **Testes**: Testes de regressão
- [ ] **Comunicação**: Comunicar mudanças aos stakeholders

### Para Novas Funcionalidades
- [ ] **Design da API**: Revisar design da API
- [ ] **Documentação**: Documentação completa
- [ ] **Exemplos**: Exemplos de uso
- [ ] **Testes**: Testes unitários e de integração
- [ ] **Validação**: Validação de entrada
- [ ] **Tratamento de Erros**: Tratamento de erros
- [ ] **Performance**: Análise de performance

## 🚨 Processo de Deprecação

### 1. Aviso de Deprecação
```markdown
### Endpoint: `GET /old/endpoint`
**Deprecado em:** v1.1.0  
**Removido em:** v2.0.0  
**Substituído por:** `GET /new/endpoint`

**Motivo:** Melhoria na estrutura de dados

**Migração:**
```javascript
// ANTES
GET /old/endpoint

// DEPOIS
GET /new/endpoint
```
```

### 2. Período de Transição
- **Mínimo 6 meses** entre deprecação e remoção
- **Manter compatibilidade** durante transição
- **Documentar migração** claramente
- **Comunicar mudanças** aos usuários

## 📊 Métricas e Monitoramento

### Endpoints Mais Utilizados
1. `GET /finance/transactions` - 45%
2. `POST /finance/transactions` - 20%
3. `GET /finance/summary` - 15%
4. `GET /auth/me` - 10%
5. `POST /auth/login` - 5%
6. Outros - 5%

### Performance
- **Tempo médio de resposta:** < 200ms
- **Disponibilidade:** 99.9%
- **Rate limiting:** Configurado
- **Caching:** Implementado

## 🔮 Roadmap de Versões

### Versão 1.1.0 (Planejada)
- [ ] **Notificações push**
- [ ] **Exportação PDF/Excel**
- [ ] **Filtros avançados**
- [ ] **Relatórios customizados**

### Versão 1.2.0 (Planejada)
- [ ] **Integração bancária**
- [ ] **Backup na nuvem**
- [ ] **Múltiplas contas**
- [ ] **API para mobile**

### Versão 2.0.0 (Futuro)
- [ ] **GraphQL support**
- [ ] **WebSocket para real-time**
- [ ] **Microservices architecture**
- [ ] **Advanced analytics**

## 🛠️ Ferramentas e Scripts

### Script de Versionamento
```bash
# Uso básico
node scripts/version-api.js [major|minor|patch] [descrição]

# Exemplos
node scripts/version-api.js major "Mudança na estrutura de resposta"
node scripts/version-api.js minor "Adicionado endpoint de notificações"
node scripts/version-api.js patch "Corrigido erro de validação"
```

### Verificar Versão Atual
```bash
# Ver versão atual
node -e "console.log(require('./scripts/version-api.js').getCurrentVersion())"
```

## 📞 Contato e Suporte

### Para Propostas de Mudanças
- **Email:** api-team@example.com
- **Slack:** #api-development
- **GitHub:** Issues no repositório

### Para Dúvidas sobre Versionamento
- **Documentação:** Este guia
- **Exemplos:** API_VERSION_CONTROL.md
- **Scripts:** scripts/version-api.js

## ⚠️ Exemplos de Breaking Changes

### 1. Mudança de Tipo de Dado
```javascript
// ANTES
{
  "id": 1  // number
}

// DEPOIS
{
  "id": "1"  // string - BREAKING CHANGE
}
```

### 2. Remoção de Campo
```javascript
// ANTES
{
  "user": {
    "id": "1",
    "name": "João",
    "oldField": "valor"  // Campo removido
  }
}

// DEPOIS
{
  "user": {
    "id": "1",
    "name": "João"
    // oldField removido - BREAKING CHANGE
  }
}
```

### 3. Mudança na Estrutura de Resposta
```javascript
// ANTES
{
  "data": {
    "transactions": [...]
  }
}

// DEPOIS
{
  "data": {
    "transactions": [...],
    "pagination": {  // Nova estrutura - BREAKING CHANGE
      "page": 1,
      "total": 100
    }
  }
}
```

## ✅ Exemplos de Mudanças Seguras

### 1. Novo Campo Opcional
```javascript
// ANTES
{
  "transaction": {
    "id": "1",
    "amount": 100.00
  }
}

// DEPOIS
{
  "transaction": {
    "id": "1",
    "amount": 100.00,
    "category": "alimentacao"  // Novo campo opcional - SEGURO
  }
}
```

### 2. Novo Endpoint
```javascript
// ANTES
GET /finance/transactions

// DEPOIS
GET /finance/transactions
GET /finance/notifications  // Novo endpoint - SEGURO
```

### 3. Correção de Bug
```javascript
// ANTES
{
  "error": "Invalid email"
}

// DEPOIS
{
  "error": "Email inválido"  // Correção de mensagem - SEGURO
}
```

---

**Última atualização:** 2024-01-15  
**Próxima revisão:** 2024-02-15  
**Responsável:** Equipe de API 