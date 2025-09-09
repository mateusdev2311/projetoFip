# Migração para MongoDB - Sistema de Triagem

Este documento explica como migrar o sistema de triagem do SQLite para MongoDB.

## 📋 Pré-requisitos

1. **MongoDB instalado** no seu sistema
2. **Node.js** versão 14 ou superior
3. **npm** ou **yarn** para gerenciamento de dependências

## 🚀 Instalação e Configuração

### 1. Instalar MongoDB

#### Windows:
```bash
# Baixar MongoDB Community Server do site oficial
# https://www.mongodb.com/try/download/community

# Ou usar Chocolatey
choco install mongodb

# Ou usar Scoop
scoop install mongodb
```

#### macOS:
```bash
# Usar Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
# Importar chave pública
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Adicionar repositório
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Instalar MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### 2. Iniciar MongoDB

#### Windows:
```bash
# Iniciar serviço MongoDB
net start MongoDB

# Ou executar manualmente
mongod --dbpath C:\data\db
```

#### macOS:
```bash
# Iniciar MongoDB
brew services start mongodb/brew/mongodb-community
```

#### Linux:
```bash
# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Instalar Dependências

```bash
cd backend
npm install
```

## 🔧 Configuração

### 1. Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` na pasta `backend`:

```env
MONGODB_URI=mongodb://localhost:27017/sistema-triagem
PORT=3000
```

### 2. Configuração de Conexão

O sistema está configurado para conectar automaticamente ao MongoDB local. A URI padrão é:
```
mongodb://localhost:27017/sistema-triagem
```

Para alterar a URI, modifique o arquivo `mongodb-config.js`:

```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'sua-uri-personalizada';
```

## 🚀 Executando o Sistema

### Opção 1: Usar o servidor MongoDB
```bash
cd backend
npm run start:mongodb
```

### Opção 2: Executar diretamente
```bash
cd backend
node server-mongodb.js
```

## 📊 Estrutura do Banco de Dados

### Coleções MongoDB:

1. **triagens** - Dados das triagens
2. **historico_triagens** - Histórico de alterações
3. **configuracoes** - Configurações do sistema

### Schemas:

- **Triagem**: Contém todos os dados da triagem com validações
- **HistoricoTriagem**: Registra todas as alterações
- **Configuracao**: Armazena configurações do sistema

## 🔄 Migração de Dados

### 1. Backup dos Dados SQLite

```bash
# Fazer backup do banco SQLite
cp backend/triagem.db backend/triagem-backup.db
```

### 2. Script de Migração (Opcional)

Se você quiser migrar dados existentes do SQLite para MongoDB, pode criar um script de migração:

```javascript
// migrate-to-mongodb.js
const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');
const Triagem = require('./models/Triagem');

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/sistema-triagem');

// Conectar ao SQLite
const db = new sqlite3.Database('./triagem.db');

// Migrar dados
db.all('SELECT * FROM triagens', async (err, rows) => {
    if (err) {
        console.error('Erro ao ler SQLite:', err);
        return;
    }
    
    for (const row of rows) {
        try {
            // Converter dados do SQLite para formato MongoDB
            const triagemData = {
                _id: row.id,
                nome: row.nome,
                idade: row.idade,
                genero: row.genero,
                // ... outros campos
                sintomas: JSON.parse(row.sintomas || '[]'),
                doencas: JSON.parse(row.doencas || '[]'),
                fatoresRisco: JSON.parse(row.fatoresRisco || '[]'),
                fatoresCriticos: JSON.parse(row.fatoresCriticos || '[]'),
                dataTriagem: new Date(row.dataTriagem),
                dataAtualizacao: new Date(row.dataAtualizacao)
            };
            
            await Triagem.create(triagemData);
            console.log(`Migrado: ${row.nome}`);
        } catch (error) {
            console.error(`Erro ao migrar ${row.nome}:`, error);
        }
    }
    
    console.log('Migração concluída!');
    process.exit(0);
});
```

## 🛠️ Comandos Úteis

### MongoDB Shell:

```bash
# Conectar ao MongoDB
mongosh

# Usar banco de dados
use sistema-triagem

# Ver coleções
show collections

# Contar documentos
db.triagens.countDocuments()

# Ver documentos
db.triagens.find().limit(5)

# Estatísticas
db.stats()
```

### Limpeza de Dados:

```bash
# Limpar todas as triagens
db.triagens.deleteMany({})

# Limpar histórico antigo (mais de 1 ano)
db.historico_triagens.deleteMany({
    data_alteracao: { $lt: new Date(Date.now() - 365*24*60*60*1000) }
})
```

## 🔍 Monitoramento

### 1. Logs do Sistema

O sistema gera logs detalhados:
- Conexão com MongoDB
- Operações de CRUD
- Erros e exceções

### 2. Métricas MongoDB

```bash
# Ver status do MongoDB
mongosh --eval "db.serverStatus()"

# Ver conexões ativas
mongosh --eval "db.serverStatus().connections"
```

## 🚨 Solução de Problemas

### 1. Erro de Conexão

```
❌ Erro ao conectar com MongoDB: connect ECONNREFUSED 127.0.0.1:27017
```

**Solução**: Verificar se o MongoDB está rodando:
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
```

### 2. Erro de Permissão

```
❌ Erro ao conectar com MongoDB: Authentication failed
```

**Solução**: Verificar credenciais ou desabilitar autenticação para desenvolvimento local.

### 3. Erro de Schema

```
❌ ValidationError: Path `nome` is required
```

**Solução**: Verificar se todos os campos obrigatórios estão sendo enviados.

## 📈 Performance

### Índices Criados Automaticamente:

- `nome` e `queixaPrincipal` (texto)
- `prioridade` (1)
- `dataTriagem` (-1)
- `idade` (1)

### Otimizações:

1. **Paginação**: Implementada para grandes volumes de dados
2. **Agregações**: Para estatísticas eficientes
3. **Índices**: Para consultas rápidas
4. **Validações**: No nível do schema

## 🔒 Segurança

### Recomendações:

1. **Autenticação**: Habilitar em produção
2. **Autorização**: Implementar controle de acesso
3. **SSL/TLS**: Usar conexões criptografadas
4. **Backup**: Fazer backups regulares

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar logs do sistema
2. Consultar documentação do MongoDB
3. Verificar status da conexão
4. Testar com dados de exemplo

---

**Nota**: Este sistema mantém compatibilidade com a API existente, então o frontend não precisa ser alterado.
