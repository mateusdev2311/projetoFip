const mongoose = require('mongoose');

// Schema para Configurações do Sistema
const configuracaoSchema = new mongoose.Schema({
    chave: {
        type: String,
        required: [true, 'Chave é obrigatória'],
        unique: true,
        trim: true
    },
    valor: {
        type: String,
        required: [true, 'Valor é obrigatório'],
        trim: true
    },
    descricao: {
        type: String,
        trim: true
    },
    data_atualizacao: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índice único na chave
configuracaoSchema.index({ chave: 1 }, { unique: true });

// Middleware para atualizar data_atualizacao
configuracaoSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.data_atualizacao = new Date();
    }
    next();
});

// Método estático para obter configuração
configuracaoSchema.statics.obterConfiguracao = async function(chave) {
    try {
        const config = await this.findOne({ chave });
        return config ? config.valor : null;
    } catch (error) {
        console.error('Erro ao obter configuração:', error);
        throw error;
    }
};

// Método estático para definir configuração
configuracaoSchema.statics.definirConfiguracao = async function(chave, valor, descricao = '') {
    try {
        return await this.findOneAndUpdate(
            { chave },
            { valor, descricao, data_atualizacao: new Date() },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Erro ao definir configuração:', error);
        throw error;
    }
};

// Método estático para inicializar configurações padrão
configuracaoSchema.statics.inicializarConfiguracoesPadrao = async function() {
    const configuracoes = [
        {
            chave: 'versao_sistema',
            valor: '1.0.0',
            descricao: 'Versão atual do sistema de triagem'
        },
        {
            chave: 'protocolo_manchester',
            valor: 'ativo',
            descricao: 'Status do protocolo de Manchester'
        },
        {
            chave: 'tempo_limpeza_historico',
            valor: '365',
            descricao: 'Dias para manter histórico de triagens (em dias)'
        },
        {
            chave: 'mongodb_uri',
            valor: 'mongodb://localhost:27017/sistema-triagem',
            descricao: 'URI de conexão com MongoDB'
        }
    ];

    try {
        for (const config of configuracoes) {
            await this.definirConfiguracao(config.chave, config.valor, config.descricao);
        }
        console.log('✅ Configurações padrão inicializadas com sucesso');
    } catch (error) {
        console.error('❌ Erro ao inicializar configurações padrão:', error);
        throw error;
    }
};

module.exports = mongoose.model('Configuracao', configuracaoSchema);
