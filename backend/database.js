const { connectToMongoDB, disconnectFromMongoDB, mongoose } = require('./mongodb-config');
const Triagem = require('./models/Triagem');
const HistoricoTriagem = require('./models/HistoricoTriagem');
const Configuracao = require('./models/Configuracao');

// Variável para controlar o estado da conexão
let isConnected = false;

// Função para inicializar a conexão com MongoDB
async function initDatabase() {
    try {
        isConnected = await connectToMongoDB();
        if (isConnected) {
            // Inicializar configurações padrão
            await Configuracao.inicializarConfiguracoesPadrao();
            console.log('✅ Banco de dados MongoDB inicializado com sucesso!');
        }
        return isConnected;
    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        return false;
    }
}

// Função para verificar se está conectado
function isDatabaseConnected() {
    return isConnected && mongoose.connection.readyState === 1;
}

// Função para fechar a conexão com o banco
async function closeDatabase() {
    try {
        await disconnectFromMongoDB();
        isConnected = false;
        console.log('🔌 Conexão com o banco de dados fechada.');
    } catch (error) {
        console.error('❌ Erro ao fechar o banco de dados:', error);
    }
}

// Função para executar operações de escrita (INSERT, UPDATE, DELETE)
async function runQuery(operation, data = {}) {
    try {
        if (!isDatabaseConnected()) {
            throw new Error('Banco de dados não está conectado');
        }

        let result;
        switch (operation) {
            case 'create':
                result = await Triagem.create(data);
                break;
            case 'update':
                result = await Triagem.findByIdAndUpdate(data.id, data.update, { new: true });
                break;
            case 'delete':
                result = await Triagem.findByIdAndDelete(data.id);
                break;
            default:
                throw new Error(`Operação não suportada: ${operation}`);
        }
        
        return { success: true, data: result };
    } catch (error) {
        console.error('Erro na operação de escrita:', error);
        throw error;
    }
}

// Função para buscar um documento específico
async function getQuery(model, filter = {}) {
    try {
        if (!isDatabaseConnected()) {
            throw new Error('Banco de dados não está conectado');
        }

        let result;
        switch (model) {
            case 'triagem':
                result = await Triagem.findOne(filter);
                break;
            case 'historico':
                result = await HistoricoTriagem.findOne(filter);
                break;
            case 'configuracao':
                result = await Configuracao.findOne(filter);
                break;
            default:
                throw new Error(`Modelo não suportado: ${model}`);
        }
        
        return result;
    } catch (error) {
        console.error('Erro na busca de documento:', error);
        throw error;
    }
}

// Função para buscar múltiplos documentos
async function allQuery(model, filter = {}, options = {}) {
    try {
        if (!isDatabaseConnected()) {
            throw new Error('Banco de dados não está conectado');
        }

        let result;
        switch (model) {
            case 'triagem':
                if (options.pagination) {
                    result = await Triagem.findWithPagination(filter, options);
                } else {
                    result = await Triagem.find(filter).sort(options.sort || { dataTriagem: -1 });
                }
                break;
            case 'historico':
                result = await HistoricoTriagem.find(filter).sort({ data_alteracao: -1 });
                break;
            case 'configuracao':
                result = await Configuracao.find(filter);
                break;
            case 'stats':
                result = await Triagem.getStats();
                break;
            default:
                throw new Error(`Modelo não suportado: ${model}`);
        }
        
        return result;
    } catch (error) {
        console.error('Erro na busca de múltiplos documentos:', error);
        throw error;
    }
}

module.exports = {
    initDatabase,
    closeDatabase,
    runQuery,
    getQuery,
    allQuery,
    isDatabaseConnected,
    Triagem,
    HistoricoTriagem,
    Configuracao
};


