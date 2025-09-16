const mongoose = require('mongoose');

// Schema para Triagem
const triagemSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => require('uuid').v4()
    },
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true
    },
    idade: {
        type: Number,
        required: [true, 'Idade é obrigatória'],
        min: [0, 'Idade não pode ser negativa'],
        max: [150, 'Idade não pode ser maior que 150']
    },
    genero: {
        type: String,
        required: [true, 'Gênero é obrigatório'],
        enum: ['masculino', 'feminino', 'outro']
    },
    peso: {
        type: Number,
        min: [0, 'Peso não pode ser negativo'],
        max: [500, 'Peso não pode ser maior que 500kg']
    },
    altura: {
        type: Number,
        min: [30, 'Altura não pode ser menor que 30cm'],
        max: [250, 'Altura não pode ser maior que 250cm']
    },
    frequenciaCardiaca: {
        type: Number,
        required: [true, 'Frequência cardíaca é obrigatória'],
        min: [20, 'Frequência cardíaca muito baixa'],
        max: [300, 'Frequência cardíaca muito alta']
    },
    frequenciaRespiratoria: {
        type: Number,
        required: [true, 'Frequência respiratória é obrigatória'],
        min: [5, 'Frequência respiratória muito baixa'],
        max: [60, 'Frequência respiratória muito alta']
    },
    temperatura: {
        type: Number,
        required: [true, 'Temperatura é obrigatória'],
        min: [30, 'Temperatura muito baixa'],
        max: [45, 'Temperatura muito alta']
    },
    pressaoSistolica: {
        type: Number,
        required: [true, 'Pressão sistólica é obrigatória'],
        min: [50, 'Pressão sistólica muito baixa'],
        max: [300, 'Pressão sistólica muito alta']
    },
    pressaoDiastolica: {
        type: Number,
        required: [true, 'Pressão diastólica é obrigatória'],
        min: [30, 'Pressão diastólica muito baixa'],
        max: [200, 'Pressão diastólica muito alta']
    },
    saturacaoOxigenio: {
        type: Number,
        required: [true, 'Saturação de oxigênio é obrigatória'],
        min: [0, 'Saturação não pode ser negativa'],
        max: [100, 'Saturação não pode ser maior que 100%']
    },
    nivelConsciencia: {
        type: String,
        required: [true, 'Nível de consciência é obrigatório'],
        enum: ['alerta', 'resposta-verbal', 'resposta-dor', 'inconsciente']
    },
    orientacao: {
        type: String,
        enum: ['orientado', 'desorientado', null]
    },
    intensidadeDor: {
        type: Number,
        default: 0,
        min: [0, 'Intensidade da dor não pode ser negativa'],
        max: [10, 'Intensidade da dor não pode ser maior que 10']
    },
    localizacaoDor: {
        type: String,
        trim: true
    },
    caracteristicaDor: {
        type: String,
        trim: true
    },
    queixaPrincipal: {
        type: String,
        required: [true, 'Queixa principal é obrigatória'],
        trim: true
    },
    tempoSintomas: {
        type: String,
        required: [true, 'Tempo dos sintomas é obrigatório'],
        trim: true
    },
    sintomas: [{
        type: String,
        trim: true
    }],
    doencas: [{
        type: String,
        trim: true
    }],
    medicamentosUso: {
        type: String,
        trim: true
    },
    alergias: {
        type: String,
        trim: true
    },
    gestante: {
        type: String,
        enum: ['sim', 'nao', 'nao_se_aplica', null]
    },
    cirurgiaRecente: {
        type: String,
        trim: true
    },
    observacoes: {
        type: String,
        trim: true
    },
    prioridade: {
        type: String,
        enum: ['EMERGÊNCIA', 'MUITO URGENTE', 'URGENTE', 'POUCO URGENTE', 'NÃO URGENTE']
    },
    pontuacao: {
        type: Number,
        min: [0, 'Pontuação não pode ser negativa']
    },
    fatoresRisco: [{
        type: String,
        trim: true
    }],
    fatoresCriticos: [{
        type: String,
        trim: true
    }],
    imc: {
        type: Number,
        min: [0, 'IMC não pode ser negativo']
    },
    dataTriagem: {
        type: Date,
        default: Date.now
    },
    dataAtualizacao: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    versionKey: false // Remove o campo __v
});

// Índices para melhor performance
triagemSchema.index({ nome: 'text', queixaPrincipal: 'text' }); // Índice de texto para busca
triagemSchema.index({ prioridade: 1 }); // Índice para filtro por prioridade
triagemSchema.index({ dataTriagem: -1 }); // Índice para ordenação por data
triagemSchema.index({ idade: 1 }); // Índice para filtros por idade

// Middleware para atualizar dataAtualizacao antes de salvar
triagemSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.dataAtualizacao = new Date();
    }
    next();
});

// Middleware para atualizar dataAtualizacao antes de atualizar
triagemSchema.pre('findOneAndUpdate', function(next) {
    this.set({ dataAtualizacao: new Date() });
    next();
});

// Método estático para buscar com paginação
triagemSchema.statics.findWithPagination = async function(filters = {}, options = {}) {
    const {
        page = 1,
        limit = 10,
        search = '',
        prioridade = '',
        data_inicio = '',
        data_fim = '',
        sortBy = 'dataTriagem',
        sortOrder = 'desc'
    } = options;

    // Construir filtros
    const query = { ...filters };

    // Filtro de busca por texto
    if (search) {
        query.$text = { $search: search };
    }

    // Filtro por prioridade
    if (prioridade) {
        query.prioridade = prioridade;
    }

    // Filtro por data
    if (data_inicio || data_fim) {
        query.dataTriagem = {};
        if (data_inicio) {
            query.dataTriagem.$gte = new Date(data_inicio);
        }
        if (data_fim) {
            query.dataTriagem.$lte = new Date(data_fim + 'T23:59:59.999Z');
        }
    }

    // Configurar ordenação
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Executar consulta com paginação
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
        this.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

// Método estático para estatísticas
triagemSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                total_triagens: { $sum: 1 },
                emergencias: {
                    $sum: { $cond: [{ $eq: ['$prioridade', 'EMERGÊNCIA'] }, 1, 0] }
                },
                muito_urgentes: {
                    $sum: { $cond: [{ $eq: ['$prioridade', 'MUITO URGENTE'] }, 1, 0] }
                },
                urgentes: {
                    $sum: { $cond: [{ $eq: ['$prioridade', 'URGENTE'] }, 1, 0] }
                },
                pouco_urgentes: {
                    $sum: { $cond: [{ $eq: ['$prioridade', 'POUCO URGENTE'] }, 1, 0] }
                },
                nao_urgentes: {
                    $sum: { $cond: [{ $eq: ['$prioridade', 'NÃO URGENTE'] }, 1, 0] }
                },
                pontuacao_media: { $avg: '$pontuacao' },
                idade_media: { $avg: '$idade' }
            }
        }
    ]);

    const triagensPorDia = await this.aggregate([
        {
            $match: {
                dataTriagem: {
                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$dataTriagem'
                    }
                },
                quantidade: { $sum: 1 }
            }
        },
        {
            $sort: { _id: -1 }
        }
    ]);

    // Distribuição por gênero
    const porGenero = await this.aggregate([
        {
            $group: {
                _id: '$genero',
                quantidade: { $sum: 1 }
            }
        }
    ]);

    // Distribuição por faixas etárias
    const porFaixaEtaria = await this.aggregate([
        {
            $bucket: {
                groupBy: '$idade',
                boundaries: [0, 1, 2, 5, 12, 18, 30, 45, 60, 75, 200],
                default: 'outros',
                output: { quantidade: { $sum: 1 } }
            }
        }
    ]);

    return {
        estatisticas: stats[0] || {
            total_triagens: 0,
            emergencias: 0,
            muito_urgentes: 0,
            urgentes: 0,
            pouco_urgentes: 0,
            nao_urgentes: 0,
            pontuacao_media: 0,
            idade_media: 0
        },
        triagens_por_dia: triagensPorDia.map(item => ({
            data: item._id,
            quantidade: item.quantidade
        })),
        distribuicao_genero: porGenero.map(item => ({ genero: item._id, quantidade: item.quantidade })),
        distribuicao_faixa_etaria: porFaixaEtaria.map(item => ({ faixa: item._id, quantidade: item.quantidade }))
    };
};

module.exports = mongoose.model('Triagem', triagemSchema);
