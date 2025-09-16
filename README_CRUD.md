# Sistema de Triagem Inteligente - CRUD Completo

Este sistema implementa um CRUD (Create, Read, Update, Delete) completo para o gerenciamento de registros de triagem médica, baseado no Protocolo de Manchester.

## 🚀 Funcionalidades Implementadas

### Backend (Node.js + Express + SQLite)
- ✅ **Criar (POST)** - Salvar novas triagens
- ✅ **Ler (GET)** - Listar e buscar triagens
- ✅ **Atualizar (PUT)** - Editar triagens existentes
- ✅ **Deletar (DELETE)** - Remover triagens
- ✅ **Estatísticas** - Dashboard com métricas
- ✅ **Histórico** - Rastreamento de alterações
- ✅ **Filtros** - Busca por nome, prioridade, data
- ✅ **Paginação** - Navegação por páginas

### Frontend (HTML + CSS + JavaScript)
- ✅ **Formulário de Triagem** - Interface completa para coleta de dados
- ✅ **Gerenciamento de Registros** - Interface CRUD completa
- ✅ **Dashboard de Estatísticas** - Visualização de métricas
- ✅ **Filtros e Busca** - Sistema de pesquisa avançada
- ✅ **Modais** - Visualização e edição de registros
- ✅ **Responsivo** - Adaptado para mobile e desktop

## 📋 Estrutura do Banco de Dados

### Tabela `triagens`
```sql
- id (TEXT PRIMARY KEY) - UUID único
- nome (TEXT) - Nome do paciente
- idade (INTEGER) - Idade em anos
- genero (TEXT) - Gênero do paciente
- peso (REAL) - Peso em kg
- altura (INTEGER) - Altura em cm
- frequenciaCardiaca (INTEGER) - FC em bpm
- frequenciaRespiratoria (INTEGER) - FR em rpm
- temperatura (REAL) - Temperatura em °C
- pressaoSistolica (INTEGER) - PA sistólica
- pressaoDiastolica (INTEGER) - PA diastólica
- saturacaoOxigenio (INTEGER) - SpO2 em %
- nivelConsciencia (TEXT) - Nível de consciência
- orientacao (TEXT) - Orientação temporal/espacial
- intensidadeDor (INTEGER) - Escala 0-10
- localizacaoDor (TEXT) - Local da dor
- caracteristicaDor (TEXT) - Característica da dor
- queixaPrincipal (TEXT) - Queixa principal
- tempoSintomas (TEXT) - Tempo de início
- sintomas (TEXT) - JSON array de sintomas
- doencas (TEXT) - JSON array de doenças
- medicamentosUso (TEXT) - Medicamentos em uso
- alergias (TEXT) - Alergias conhecidas
- gestante (TEXT) - Status de gestação
- cirurgiaRecente (TEXT) - Cirurgia recente
- observacoes (TEXT) - Observações adicionais
- prioridade (TEXT) - Classificação de prioridade
- pontuacao (INTEGER) - Pontuação de risco
- fatoresRisco (TEXT) - JSON array de fatores
- fatoresCriticos (TEXT) - JSON array de fatores críticos
- imc (REAL) - Índice de Massa Corporal
- dataTriagem (DATETIME) - Data da triagem
- dataAtualizacao (DATETIME) - Última atualização
```

### Tabela `historico_triagens`
```sql
- id (INTEGER PRIMARY KEY) - ID auto-incremento
- triagem_id (TEXT) - ID da triagem
- acao (TEXT) - Tipo de ação (CRIACAO, ATUALIZACAO, EXCLUSAO)
- dados_anteriores (TEXT) - JSON dos dados anteriores
- dados_novos (TEXT) - JSON dos novos dados
- usuario (TEXT) - Usuário responsável
- data_alteracao (DATETIME) - Data da alteração
```

### Tabela `configuracoes`
```sql
- chave (TEXT PRIMARY KEY) - Chave da configuração
- valor (TEXT) - Valor da configuração
- descricao (TEXT) - Descrição da configuração
- data_atualizacao (DATETIME) - Data de atualização
```

## 🛠️ Instalação e Configuração

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar ambiente (MongoDB)
Crie um arquivo `.env` em `backend/` com:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/triagem
```

### 3. Iniciar o Servidor (MongoDB)
```bash
cd backend
npm start
```

O servidor será iniciado na porta definida em `PORT` (padrão 3000).

### 4. Acessar o Sistema
- **Formulário de Triagem**: http://localhost:3000/index.html
- **Gerenciamento (CRUD)**: http://localhost:3000/gerenciar.html
- **Painel de Chamada**: http://localhost:3000/painel.html
- **Documentação da API (Swagger)**: http://localhost:3000/api-docs
- **API Base**: http://localhost:3000/api/triagens

## 📊 Endpoints da API

### GET /api/triagens
Lista todas as triagens com paginação e filtros.

**Parâmetros de Query:**
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 10)
- `search` - Busca por nome ou queixa
- `prioridade` - Filtro por prioridade
- `data_inicio` - Data início (YYYY-MM-DD)
- `data_fim` - Data fim (YYYY-MM-DD)

**Exemplo:**
```
GET /api/triagens?page=1&limit=10&search=João&prioridade=EMERGÊNCIA
```

### GET /api/triagens/:id
Busca uma triagem específica por ID.

### POST /api/triagens
Cria uma nova triagem.

**Body (JSON):**
```json
{
  "nome": "João Silva",
  "idade": 45,
  "genero": "masculino",
  "frequenciaCardiaca": 80,
  "frequenciaRespiratoria": 16,
  "temperatura": 36.5,
  "pressaoSistolica": 120,
  "pressaoDiastolica": 80,
  "saturacaoOxigenio": 98,
  "nivelConsciencia": "alerta",
  "queixaPrincipal": "Dor no peito",
  "tempoSintomas": "1-6h"
}
```

Exemplo (curl):
```bash
curl -X POST http://localhost:3000/api/triagens \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "idade": 45,
    "genero": "masculino",
    "frequenciaCardiaca": 80,
    "frequenciaRespiratoria": 16,
    "temperatura": 36.5,
    "pressaoSistolica": 120,
    "pressaoDiastolica": 80,
    "saturacaoOxigenio": 98,
    "nivelConsciencia": "alerta",
    "queixaPrincipal": "Dor no peito",
    "tempoSintomas": "1-6h"
  }'
```

### PUT /api/triagens/:id
Atualiza uma triagem existente.

Exemplo (curl):
```bash
curl -X PUT http://localhost:3000/api/triagens/SEU_ID \
  -H "Content-Type: application/json" \
  -d '{
    "frequenciaCardiaca": 95,
    "temperatura": 38.1,
    "queixaPrincipal": "Cefaleia intensa"
  }'
```

### DELETE /api/triagens/:id
Remove uma triagem.

Exemplo (curl):
```bash
curl -X DELETE http://localhost:3000/api/triagens/SEU_ID
```

### GET /api/triagens/stats/geral
Retorna estatísticas gerais das triagens.

Exemplo (curl):
```bash
curl http://localhost:3000/api/triagens/stats/geral
```

### GET /api/triagens/:id/historico
Retorna o histórico de alterações de uma triagem.

Exemplo (curl):
```bash
curl http://localhost:3000/api/triagens/SEU_ID/historico
```

## 🎯 Classificação de Prioridades

O sistema utiliza o Protocolo de Manchester para classificar as prioridades:

- 🔴 **EMERGÊNCIA** - Atendimento imediato (0 minutos)
- 🟠 **MUITO URGENTE** - Até 10 minutos
- 🟡 **URGENTE** - Até 60 minutos
- 🟢 **POUCO URGENTE** - Até 120 minutos
- 🔵 **NÃO URGENTE** - Até 240 minutos

## 🔍 Funcionalidades de Busca e Filtros

### Filtros Disponíveis:
- **Busca por texto** - Nome do paciente ou queixa principal
- **Filtro por prioridade** - Todas as classificações
- **Filtro por data** - Período específico
- **Combinação de filtros** - Múltiplos critérios simultâneos

### Paginação:
- Navegação por páginas
- Controle de itens por página
- Informações de total de registros

## 📱 Interface Responsiva

O sistema é totalmente responsivo e funciona em:
- 💻 Desktop
- 📱 Mobile
- 📟 Tablet

## 🔒 Segurança e Validação

- Validação de dados obrigatórios
- Sanitização de entradas
- Controle de tipos de dados
- Validação de faixas de valores
- Histórico de alterações para auditoria

## 📈 Estatísticas e Relatórios

O dashboard apresenta:
- Total de triagens por prioridade
- Média de pontuação de risco
- Média de idade dos pacientes
- Gráfico de triagens por dia (últimos 30 dias)
- Distribuição por classificação de risco

## 🚀 Próximas Funcionalidades

- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Sistema de usuários e permissões
- [ ] Notificações em tempo real
- [ ] Integração com sistemas hospitalares
- [ ] API de integração com equipamentos médicos
- [ ] Backup automático do banco de dados
- [ ] Logs de auditoria detalhados

## 👥 Desenvolvedores

- Mateus Costa
- Pedro Henrique
- Isabella
- Hiago
- Heitor
- Jhon Lucas

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de pesquisa em saúde.

---

**Sistema de Triagem Inteligente v1.0.0**  
*Protocolo de Manchester - Padrão oficial adotado no Brasil*

## 🧪 Fluxo completo via curl (exemplo)

```bash
# 1) Criar triagem e capturar ID
ID=$(curl -s -X POST http://localhost:3000/api/triagens \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Fluxo",
    "idade": 40,
    "genero": "masculino",
    "frequenciaCardiaca": 90,
    "frequenciaRespiratoria": 18,
    "temperatura": 37.2,
    "pressaoSistolica": 125,
    "pressaoDiastolica": 82,
    "saturacaoOxigenio": 97,
    "nivelConsciencia": "alerta",
    "queixaPrincipal": "Dor abdominal",
    "tempoSintomas": "1-6h"
  }' | powershell -Command "($input | ConvertFrom-Json).data.id")

echo ID criado: $ID

# 2) Buscar por ID
curl http://localhost:3000/api/triagens/$ID | jq

# 3) Atualizar parcialmente
curl -X PUT http://localhost:3000/api/triagens/$ID \
  -H "Content-Type: application/json" \
  -d '{
    "temperatura": 38.4,
    "queixaPrincipal": "Dor abdominal intensa"
  }' | jq

# 4) Listar com paginação/filtros
curl "http://localhost:3000/api/triagens?page=1&limit=5&prioridade=URGENTE" | jq

# 5) Deletar
curl -X DELETE http://localhost:3000/api/triagens/$ID | jq
```



