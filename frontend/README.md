# 💰 Controle Financeiro - Frontend

Sistema completo de controle financeiro pessoal com autenticação robusta, gestão de dívidas e interface moderna.

## 🚀 Funcionalidades

### ✅ Sistema Principal
- **Dashboard Financeiro** com resumo mensal
- **Controle de Transações** (receitas e despesas)
- **Gestão de Parcelamentos** com acompanhamento
- **Gastos Fixos** e variáveis
- **Metas Financeiras** com progresso
- **Relatórios** e gráficos interativos

### ✅ Sistema de Dívidas
- **Gestão de Pessoas** (amigos, familiares, etc.)
- **Controle de Dívidas** por pessoa
- **Acompanhamento de Pagamentos**
- **Histórico Completo**

### ✅ Autenticação e Segurança
- **Login/Registro** com validação
- **Proteção de Rotas** 
- **Persistência de Sessão**
- **Logout Seguro**

### ✅ Interface
- **Design Responsivo** (mobile, tablet, desktop)
- **Modo Escuro/Claro**
- **Animações Suaves**
- **Interface Intuitiva**
- **Navegação por Meses** com recarregamento automático de dados

## 🛠️ Tecnologias

- **React 18** + TypeScript
- **Tailwind CSS** + DaisyUI
- **Lucide React** (ícones)
- **Recharts** (gráficos)
- **Date-fns** (manipulação de datas)

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <repository-url>
cd controle-financeiro/frontend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp env.example .env
```

Edite o arquivo `.env`:
```env
REACT_APP_API_URL=https://solidtechsolutions.com.br/api
```

### 4. Execute o projeto
```bash
npm start
```

O projeto estará disponível em `http://localhost:3000`

## 🔧 Configuração da API

### Backend Necessário
O frontend espera um backend com as seguintes rotas:

#### Autenticação
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`

#### Finanças
- `GET /api/finance/transactions?month=YYYY-MM`
- `POST /api/finance/transactions`
- `PUT /api/finance/transactions/{id}`
- `DELETE /api/finance/transactions/{id}`
- `GET /api/finance/summary`
- `GET /api/finance/goals`
- `POST /api/finance/goals`

#### Dívidas
- `GET /api/debts/people`
- `POST /api/debts/people`
- `GET /api/debts?month=YYYY-MM`
- `POST /api/debts`
- `PATCH /api/debts/{id}/payment`

#### Configurações
- `GET /api/config/categories`
- `GET /api/config/relationships`

### 🔄 Navegação por Meses

O sistema agora suporta **recarregamento automático de dados** quando o usuário troca de mês:

#### Funcionalidade
- ✅ **Recarregamento Automático**: Dados são atualizados ao trocar de mês
- ✅ **Performance Otimizada**: Requests apenas quando necessário
- ✅ **UX Consistente**: Mesmo comportamento em finanças e dívidas
- ✅ **Estado Persistente**: Mês selecionado é mantido entre navegações

#### Como Funciona
1. **Usuário clica** em um mês diferente na navegação
2. **Sistema detecta** a mudança no `currentMonth`
3. **Request automático** é feito para a API com o novo mês
4. **Dados são atualizados** e a interface é re-renderizada

#### Endpoints Utilizados
- **Finanças**: `GET /finance/transactions?month=YYYY-MM`
- **Dívidas**: `GET /debts?month=YYYY-MM`

### Documentação Completa
Veja `API_DOCUMENTATION.md` para a documentação completa dos contratos de API.

### Versionamento da API
- **VERSIONING_GUIDE.md**: Guia completo de versionamento
- **API_VERSION_CONTROL.md**: Controle de versões e histórico
- **scripts/version-api.js**: Script para automatizar versionamento

#### 🚀 Como Usar o Versionamento

**A PARTIR DE AGORA**, todas as mudanças na API devem ser versionadas:

##### 1. Identificar o Tipo de Mudança
```bash
# Breaking Changes (MAJOR) - Quebram compatibilidade
- Remoção de endpoints
- Mudança na estrutura de resposta
- Mudança obrigatória em campos existentes
- Mudança na autenticação

# Novas Funcionalidades (MINOR) - Adicionam recursos
- Novos endpoints
- Novos campos opcionais
- Novos parâmetros opcionais

# Correções (PATCH) - Corrigem bugs
- Correção de bugs
- Melhoria na documentação
- Correção de exemplos
```

##### 2. Executar o Script de Versionamento
```bash
# Para Breaking Changes
node scripts/version-api.js major "Mudança na estrutura de resposta de usuários"

# Para Novas Funcionalidades
node scripts/version-api.js minor "Adicionado endpoint de notificações"

# Para Correções
node scripts/version-api.js patch "Corrigido erro de validação de email"
```

##### 3. Verificar Arquivos Atualizados
O script atualiza automaticamente:
- ✅ **API_DOCUMENTATION.md** - Versão e histórico
- ✅ **API_VERSION_CONTROL.md** - Controle de versões
- ✅ **CHANGELOG.md** - Log detalhado de mudanças

##### 4. Revisar e Testar
- [ ] **Revisar mudanças** nos arquivos atualizados
- [ ] **Testar compatibilidade** com frontend
- [ ] **Validar documentação** está correta
- [ ] **Comunicar mudanças** à equipe

##### 5. Exemplos de Uso
```bash
# Exemplo 1: Adicionar novo endpoint
node scripts/version-api.js minor "Adicionado GET /finance/notifications"

# Exemplo 2: Corrigir bug de validação
node scripts/version-api.js patch "Corrigido validação de email"

# Exemplo 3: Breaking change na resposta
node scripts/version-api.js major "Mudança na estrutura de resposta de transações"
```

##### 6. Verificar Versão Atual
```bash
# Ver versão atual da API
node -e "console.log(require('./scripts/version-api.js').getCurrentVersion())"
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── auth/           # Componentes de autenticação
│   ├── debt/           # Componentes do sistema de dívidas
│   └── ...             # Outros componentes
├── context/
│   ├── AuthContext.tsx     # Contexto de autenticação
│   ├── FinancialContext.tsx # Contexto financeiro
│   └── DebtContext.tsx      # Contexto de dívidas
├── hooks/
│   └── useTheme.ts          # Hook para tema
├── types/
│   └── index.ts             # Tipos TypeScript
└── App.tsx                  # Componente principal
```

## 🔐 Autenticação

### Fluxo de Autenticação
1. **Login/Registro** → Recebe token JWT
2. **Token armazenado** no localStorage
3. **Requests autenticados** com header `Authorization: Bearer {token}`
4. **Logout** → Remove token e redireciona

### Proteção de Rotas
- Todas as rotas são protegidas por `ProtectedRoute`
- Usuários não autenticados são redirecionados para login
- Sessão persistida entre refreshs

## 🎨 Temas

### Modo Escuro/Claro
- Toggle automático no header
- Preferência salva no localStorage
- Transições suaves entre temas

### Cores e Estilos
- **Primary**: Azul corporativo
- **Secondary**: Verde financeiro
- **Success**: Verde para receitas
- **Error**: Vermelho para despesas
- **Warning**: Amarelo para alertas

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Componentes Adaptativos
- Cards responsivos
- Tabelas com scroll horizontal
- Navegação mobile-friendly
- Modais otimizados

## 🔄 Estados de Loading

### Feedback Visual
- **Spinners** durante requests
- **Skeleton loading** para listas
- **Disabled states** em formulários
- **Progress indicators** para operações longas

## 🚨 Tratamento de Erros

### Tipos de Erro
- **Validação**: Erros de formulário
- **Rede**: Falhas de conexão
- **Autenticação**: Token inválido
- **Servidor**: Erros 500

### Feedback ao Usuário
- **Alertas visuais** com ícones
- **Mensagens específicas** por erro
- **Retry automático** para falhas de rede
- **Fallback UI** para estados de erro

## 📊 Performance

### Otimizações
- **Lazy loading** de componentes
- **Memoização** de cálculos pesados
- **Debounce** em inputs
- **Virtualização** para listas grandes

### Bundle Size
- **Code splitting** por rota
- **Tree shaking** automático
- **Compression** de assets

## 🧪 Testes

### Executar Testes
```bash
npm test
```

### Cobertura
```bash
npm run test:coverage
```

## 🚀 Build de Produção

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## 📈 Monitoramento

### Logs
- **Console logs** para desenvolvimento
- **Error boundaries** para captura de erros
- **Performance monitoring** (opcional)

### Analytics
- **Google Analytics** (configurável)
- **Sentry** para error tracking (opcional)

## 🔧 Scripts Disponíveis

```bash
npm start          # Desenvolvimento
npm run build      # Build de produção
npm run test       # Executar testes
npm run eject      # Eject (irreversível)
```

## 🔄 Versionamento da API

### Processo Obrigatório
**A PARTIR DE AGORA**, todas as mudanças na API seguem este processo:

1. **Identificar mudança** (major/minor/patch)
2. **Executar script** de versionamento
3. **Revisar arquivos** atualizados
4. **Testar compatibilidade**
5. **Comunicar mudanças**

### Comandos de Versionamento
```bash
# Breaking Changes (MAJOR)
node scripts/version-api.js major "Descrição da mudança"

# Novas Funcionalidades (MINOR)
node scripts/version-api.js minor "Descrição da funcionalidade"

# Correções (PATCH)
node scripts/version-api.js patch "Descrição da correção"
```

### Arquivos de Controle
- **API_DOCUMENTATION.md**: Documentação principal com versão
- **API_VERSION_CONTROL.md**: Histórico de versões
- **VERSIONING_GUIDE.md**: Guia completo
- **CHANGELOG.md**: Log de mudanças (automático)

## 🤝 Contribuição

### Padrões de Código
- **ESLint** + **Prettier** configurados
- **TypeScript** strict mode
- **Conventional Commits**

### Estrutura de Commits
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: manutenção
```

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

### Problemas Comuns

#### 1. Erro de CORS
- Verifique se o backend está rodando
- Confirme a URL da API no `.env`

#### 2. Token Inválido
- Faça logout e login novamente
- Verifique se o token não expirou

#### 3. Dados não carregam
- Verifique a conexão com a API
- Confirme se as rotas estão funcionando

### Logs de Debug
```bash
# Habilitar logs detalhados
REACT_APP_DEBUG=true npm start
```

### Problemas com Versionamento

#### 1. Erro no Script de Versionamento
```bash
# Verificar se o Node.js está instalado
node --version

# Verificar se o script existe
ls scripts/version-api.js

# Executar com permissões
chmod +x scripts/version-api.js
```

#### 2. Arquivos Não Atualizados
```bash
# Verificar versão atual
node -e "console.log(require('./scripts/version-api.js').getCurrentVersion())"

# Forçar atualização manual
node scripts/version-api.js patch "Correção manual"
```

#### 3. Conflito de Versões
```bash
# Verificar histórico de versões
cat API_VERSION_CONTROL.md

# Verificar changelog
cat CHANGELOG.md
```

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] **Notificações push**
- [ ] **Exportação PDF/Excel**
- [ ] **Backup na nuvem**
- [ ] **Múltiplas contas**
- [ ] **Relatórios avançados**
- [ ] **Integração bancária**

### Melhorias Técnicas
- [ ] **PWA** (Progressive Web App)
- [ ] **Offline mode**
- [ ] **Push notifications**
- [ ] **Service workers**
- [ ] **Performance optimization**

---

**Desenvolvido com ❤️ para controle financeiro pessoal** 