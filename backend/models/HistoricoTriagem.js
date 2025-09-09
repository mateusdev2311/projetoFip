const mongoose = require('mongoose');

// Schema para Histórico de Triagens
const historicoTriagemSchema = new mongoose.Schema({
    triagem_id: {
        type: String,
        required: [true, 'ID da triagem é obrigatório'],
        ref: 'Triagem'
    },
    acao: {
        type: String,
        required: [true, 'Ação é obrigatória'],
        enum: ['CRIACAO', 'ATUALIZACAO', 'EXCLUSAO']
    },
    dados_anteriores: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    dados_novos: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    usuario: {
        type: String,
        trim: true,
        default: 'sistema'
    },
    data_alteracao: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índices para melhor performance
historicoTriagemSchema.index({ triagem_id: 1, data_alteracao: -1 });
historicoTriagemSchema.index({ acao: 1 });
historicoTriagemSchema.index({ data_alteracao: -1 });

// Método estático para registrar histórico
historicoTriagemSchema.statics.registrarHistorico = async function(triagemId, acao, dadosAnteriores = null, dadosNovos = null, usuario = 'sistema') {
    try {
        const historico = new this({
            triagem_id: triagemId,
            acao,
            dados_anteriores: dadosAnteriores,
            dados_novos: dadosNovos,
            usuario
        });
        
        await historico.save();
        return historico;
    } catch (error) {
        console.error('Erro ao registrar histórico:', error);
        throw error;
    }
};

// Método estático para buscar histórico de uma triagem
historicoTriagemSchema.statics.buscarHistoricoTriagem = async function(triagemId) {
    try {
        return await this.find({ triagem_id: triagemId })
            .sort({ data_alteracao: -1 })
            .lean();
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        throw error;
    }
};

// Método estático para limpar histórico antigo
historicoTriagemSchema.statics.limparHistoricoAntigo = async function(diasParaManter = 365) {
    try {
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - diasParaManter);
        
        const resultado = await this.deleteMany({
            data_alteracao: { $lt: dataLimite }
        });
        
        console.log(`Histórico limpo: ${resultado.deletedCount} registros removidos`);
        return resultado.deletedCount;
    } catch (error) {
        console.error('Erro ao limpar histórico:', error);
        throw error;
    }
};

module.exports = mongoose.model('HistoricoTriagem', historicoTriagemSchema);
