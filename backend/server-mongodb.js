const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { 
    initDatabase, 
    runQuery, 
    getQuery, 
    allQuery, 
    isDatabaseConnected,
    Triagem,
    HistoricoTriagem 
} = require('./database');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Swagger
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Servir arquivos estáticos
app.use(express.static('../'));

// Middleware para verificar conexão com banco
app.use('/api', (req, res, next) => {
    if (!isDatabaseConnected()) {
        return res.status(503).json({
            success: false,
            message: 'Banco de dados não está conectado'
        });
    }
    next();
});

// Rota principal
app.get('/', (req, res) => {
    res.send('<h1>Sistema de Triagem Inteligente - Backend MongoDB</h1><p>API funcionando corretamente!</p>');
});

// ==================== ENDPOINTS CRUD ====================

// GET - Listar todas as triagens
app.get('/api/triagens', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', prioridade = '', data_inicio = '', data_fim = '' } = req.query;
        
        // Construir filtros
        const filter = {};
        
        if (prioridade) {
            filter.prioridade = prioridade;
        }
        
        if (data_inicio || data_fim) {
            filter.dataTriagem = {};
            if (data_inicio) {
                filter.dataTriagem.$gte = new Date(data_inicio);
            }
            if (data_fim) {
                filter.dataTriagem.$lte = new Date(data_fim + 'T23:59:59.999Z');
            }
        }
        
        // Opções para paginação e busca
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            sortBy: 'dataTriagem',
            sortOrder: 'desc',
            pagination: true
        };
        
        const result = await allQuery('triagem', filter, options);
        
        // Normalizar documentos para expor `id` no lugar de `_id`
        const data = (result.data || []).map(doc => {
            const { _id, __v, ...rest } = doc;
            return { id: _id, ...rest };
        });
        
        res.json({
            success: true,
            data,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Erro ao buscar triagens:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// GET - Buscar triagem por ID
app.get('/api/triagens/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const triagem = await getQuery('triagem', { _id: id });
        
        if (!triagem) {
            return res.status(404).json({
                success: false,
                message: 'Triagem não encontrada'
            });
        }
        
        const { _id, __v, ...rest } = triagem.toObject ? triagem.toObject() : triagem;
        res.json({
            success: true,
            data: { id: _id, ...rest }
        });
    } catch (error) {
        console.error('Erro ao buscar triagem:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// POST - Criar nova triagem
app.post('/api/triagens', async (req, res) => {
    try {
        const dadosTriagem = req.body;
        const id = uuidv4();
        
        // Validar dados obrigatórios
        const camposObrigatorios = [
            'nome', 'idade', 'genero', 'frequenciaCardiaca', 'frequenciaRespiratoria',
            'temperatura', 'pressaoSistolica', 'pressaoDiastolica', 'saturacaoOxigenio',
            'nivelConsciencia', 'queixaPrincipal', 'tempoSintomas'
        ];
        
        for (let campo of camposObrigatorios) {
            if (!dadosTriagem[campo] && dadosTriagem[campo] !== 0) {
                return res.status(400).json({
                    success: false,
                    message: `Campo obrigatório ausente: ${campo}`
                });
            }
        }
        
        // Calcular prioridade e pontuação
        const resultado = calcularPrioridade(dadosTriagem);
        
        // Preparar dados para inserção
        const dadosParaInserir = {
            _id: id,
            nome: dadosTriagem.nome,
            idade: dadosTriagem.idade,
            genero: dadosTriagem.genero,
            peso: dadosTriagem.peso || null,
            altura: dadosTriagem.altura || null,
            frequenciaCardiaca: dadosTriagem.frequenciaCardiaca,
            frequenciaRespiratoria: dadosTriagem.frequenciaRespiratoria,
            temperatura: dadosTriagem.temperatura,
            pressaoSistolica: dadosTriagem.pressaoSistolica,
            pressaoDiastolica: dadosTriagem.pressaoDiastolica,
            saturacaoOxigenio: dadosTriagem.saturacaoOxigenio,
            nivelConsciencia: dadosTriagem.nivelConsciencia,
            orientacao: dadosTriagem.orientacao || null,
            intensidadeDor: dadosTriagem.intensidadeDor || 0,
            localizacaoDor: dadosTriagem.localizacaoDor || null,
            caracteristicaDor: dadosTriagem.caracteristicaDor || null,
            queixaPrincipal: dadosTriagem.queixaPrincipal,
            tempoSintomas: dadosTriagem.tempoSintomas,
            sintomas: dadosTriagem.sintomas || [],
            doencas: dadosTriagem.doencas || [],
            medicamentosUso: dadosTriagem.medicamentosUso || null,
            alergias: dadosTriagem.alergias || null,
            gestante: dadosTriagem.gestante || null,
            cirurgiaRecente: dadosTriagem.cirurgiaRecente || null,
            observacoes: dadosTriagem.observacoes || null,
            prioridade: resultado.prioridade,
            pontuacao: resultado.pontuacao,
            fatoresRisco: resultado.fatoresRisco,
            fatoresCriticos: resultado.fatoresCriticos,
            imc: resultado.imc
        };
        
        const triagem = await runQuery('create', dadosParaInserir);
        
        // Registrar no histórico
        await HistoricoTriagem.registrarHistorico(
            id, 
            'CRIACAO', 
            null, 
            dadosParaInserir
        );
        
        res.status(201).json({
            success: true,
            message: 'Triagem criada com sucesso',
            data: { id, ...dadosParaInserir, resultado }
        });
    } catch (error) {
        console.error('Erro ao criar triagem:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// PUT - Atualizar triagem
app.put('/api/triagens/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizacao = req.body;
        
        // Verificar se a triagem existe
        const triagemExistente = await getQuery('triagem', { _id: id });
        if (!triagemExistente) {
            return res.status(404).json({
                success: false,
                message: 'Triagem não encontrada'
            });
        }
        
        // Calcular nova prioridade se necessário
        const dadosCompletos = { ...triagemExistente, ...dadosAtualizacao };
        const resultado = calcularPrioridade(dadosCompletos);
        
        // Preparar dados para atualização
        const dadosParaAtualizar = {
            nome: dadosAtualizacao.nome || triagemExistente.nome,
            idade: dadosAtualizacao.idade || triagemExistente.idade,
            genero: dadosAtualizacao.genero || triagemExistente.genero,
            peso: dadosAtualizacao.peso !== undefined ? dadosAtualizacao.peso : triagemExistente.peso,
            altura: dadosAtualizacao.altura !== undefined ? dadosAtualizacao.altura : triagemExistente.altura,
            frequenciaCardiaca: dadosAtualizacao.frequenciaCardiaca || triagemExistente.frequenciaCardiaca,
            frequenciaRespiratoria: dadosAtualizacao.frequenciaRespiratoria || triagemExistente.frequenciaRespiratoria,
            temperatura: dadosAtualizacao.temperatura || triagemExistente.temperatura,
            pressaoSistolica: dadosAtualizacao.pressaoSistolica || triagemExistente.pressaoSistolica,
            pressaoDiastolica: dadosAtualizacao.pressaoDiastolica || triagemExistente.pressaoDiastolica,
            saturacaoOxigenio: dadosAtualizacao.saturacaoOxigenio || triagemExistente.saturacaoOxigenio,
            nivelConsciencia: dadosAtualizacao.nivelConsciencia || triagemExistente.nivelConsciencia,
            orientacao: dadosAtualizacao.orientacao !== undefined ? dadosAtualizacao.orientacao : triagemExistente.orientacao,
            intensidadeDor: dadosAtualizacao.intensidadeDor !== undefined ? dadosAtualizacao.intensidadeDor : triagemExistente.intensidadeDor,
            localizacaoDor: dadosAtualizacao.localizacaoDor !== undefined ? dadosAtualizacao.localizacaoDor : triagemExistente.localizacaoDor,
            caracteristicaDor: dadosAtualizacao.caracteristicaDor !== undefined ? dadosAtualizacao.caracteristicaDor : triagemExistente.caracteristicaDor,
            queixaPrincipal: dadosAtualizacao.queixaPrincipal || triagemExistente.queixaPrincipal,
            tempoSintomas: dadosAtualizacao.tempoSintomas || triagemExistente.tempoSintomas,
            sintomas: dadosAtualizacao.sintomas || triagemExistente.sintomas,
            doencas: dadosAtualizacao.doencas || triagemExistente.doencas,
            medicamentosUso: dadosAtualizacao.medicamentosUso !== undefined ? dadosAtualizacao.medicamentosUso : triagemExistente.medicamentosUso,
            alergias: dadosAtualizacao.alergias !== undefined ? dadosAtualizacao.alergias : triagemExistente.alergias,
            gestante: dadosAtualizacao.gestante !== undefined ? dadosAtualizacao.gestante : triagemExistente.gestante,
            cirurgiaRecente: dadosAtualizacao.cirurgiaRecente !== undefined ? dadosAtualizacao.cirurgiaRecente : triagemExistente.cirurgiaRecente,
            observacoes: dadosAtualizacao.observacoes !== undefined ? dadosAtualizacao.observacoes : triagemExistente.observacoes,
            prioridade: resultado.prioridade,
            pontuacao: resultado.pontuacao,
            fatoresRisco: resultado.fatoresRisco,
            fatoresCriticos: resultado.fatoresCriticos,
            imc: resultado.imc
        };
        
        const triagem = await runQuery('update', { id, update: dadosParaAtualizar });
        
        // Registrar no histórico
        await HistoricoTriagem.registrarHistorico(
            id, 
            'ATUALIZACAO', 
            triagemExistente, 
            dadosParaAtualizar
        );
        
        res.json({
            success: true,
            message: 'Triagem atualizada com sucesso',
            data: { id, ...dadosParaAtualizar, resultado }
        });
    } catch (error) {
        console.error('Erro ao atualizar triagem:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// DELETE - Deletar triagem
app.delete('/api/triagens/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar se a triagem existe
        const triagem = await getQuery('triagem', { _id: id });
        if (!triagem) {
            return res.status(404).json({
                success: false,
                message: 'Triagem não encontrada'
            });
        }
        
        // Deletar triagem
        await runQuery('delete', { id });
        
        // Registrar no histórico
        await HistoricoTriagem.registrarHistorico(
            id, 
            'EXCLUSAO', 
            triagem, 
            null
        );
        
        res.json({
            success: true,
            message: 'Triagem deletada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar triagem:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// GET - Estatísticas das triagens
app.get('/api/triagens/stats/geral', async (req, res) => {
    try {
        const stats = await allQuery('stats');
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// GET - Histórico de uma triagem
app.get('/api/triagens/:id/historico', async (req, res) => {
    try {
        const { id } = req.params;
        const historico = await HistoricoTriagem.buscarHistoricoTriagem(id);
        
        res.json({
            success: true,
            data: historico
        });
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// ==================== FUNÇÃO DE CÁLCULO DE PRIORIDADE ====================

function calcularPrioridade(dados) {
    let pontuacao = 0;
    let fatoresRisco = [];
    let fatoresCriticos = [];
    
    // Análise do Nível de Consciência (CRÍTICO)
    switch (dados.nivelConsciencia) {
        case 'inconsciente':
            pontuacao += 150;
            fatoresCriticos.push('Paciente inconsciente');
            break;
        case 'resposta-dor':
            pontuacao += 120;
            fatoresCriticos.push('Resposta apenas à dor');
            break;
        case 'resposta-verbal':
            pontuacao += 80;
            fatoresRisco.push('Resposta apenas verbal');
            break;
        case 'alerta':
            if (dados.orientacao === 'desorientado') {
                pontuacao += 40;
                fatoresRisco.push('Alerta mas desorientado');
            }
            break;
    }
    
    // Análise da Saturação de Oxigênio (CRÍTICO)
    if (dados.saturacaoOxigenio < 85) {
        pontuacao += 120;
        fatoresCriticos.push('Saturação de oxigênio criticamente baixa');
    } else if (dados.saturacaoOxigenio < 90) {
        pontuacao += 90;
        fatoresRisco.push('Saturação de oxigênio baixa');
    } else if (dados.saturacaoOxigenio < 95) {
        pontuacao += 50;
        fatoresRisco.push('Saturação de oxigênio reduzida');
    }
    
    // Análise da Frequência Respiratória
    if (dados.frequenciaRespiratoria < 8 || dados.frequenciaRespiratoria > 35) {
        pontuacao += 100;
        fatoresCriticos.push('Frequência respiratória crítica');
    } else if (dados.frequenciaRespiratoria < 12 || dados.frequenciaRespiratoria > 28) {
        pontuacao += 60;
        fatoresRisco.push('Frequência respiratória alterada');
    }
    
    // Análise da Frequência Cardíaca
    if (dados.frequenciaCardiaca > 150 || dados.frequenciaCardiaca < 40) {
        pontuacao += 90;
        fatoresCriticos.push('Frequência cardíaca crítica');
    } else if (dados.frequenciaCardiaca > 120 || dados.frequenciaCardiaca < 50) {
        pontuacao += 60;
        fatoresRisco.push('Frequência cardíaca alterada');
    }
    
    // Análise da Pressão Arterial
    if (dados.pressaoSistolica > 220 || dados.pressaoSistolica < 70) {
        pontuacao += 80;
        fatoresCriticos.push('Pressão arterial crítica');
    } else if (dados.pressaoSistolica > 180 || dados.pressaoSistolica < 90) {
        pontuacao += 40;
        fatoresRisco.push('Hipertensão arterial');
    }
    
    // Análise da Temperatura
    if (dados.temperatura > 41 || dados.temperatura < 34.5) {
        pontuacao += 80;
        fatoresCriticos.push('Temperatura corporal crítica');
    } else if (dados.temperatura > 39.5 || dados.temperatura < 35) {
        pontuacao += 50;
        fatoresRisco.push('Febre alta ou hipotermia');
    }
    
    // Análise da Dor
    if (dados.intensidadeDor >= 9) {
        pontuacao += 70;
        fatoresRisco.push('Dor severa insuportável');
    } else if (dados.intensidadeDor >= 7) {
        pontuacao += 50;
        fatoresRisco.push('Dor severa');
    } else if (dados.intensidadeDor >= 5) {
        pontuacao += 30;
        fatoresRisco.push('Dor moderada');
    }
    
    // Análise de Sintomas Associados
    const sintomas = dados.sintomas || [];
    const sintomasCriticos = ['convulsao', 'sangramento', 'falta-ar'];
    
    sintomas.forEach(sintoma => {
        if (sintomasCriticos.includes(sintoma)) {
            pontuacao += 60;
            fatoresCriticos.push(`Sintoma crítico: ${sintoma.replace('-', ' ')}`);
        } else {
            pontuacao += 10;
            fatoresRisco.push(`Sintoma: ${sintoma.replace('-', ' ')}`);
        }
    });
    
    // Fatores de Idade
    if (dados.idade > 80) {
        pontuacao += 25;
        fatoresRisco.push('Idade muito avançada');
    } else if (dados.idade < 1) {
        pontuacao += 30;
        fatoresCriticos.push('Recém-nascido');
    }
    
    // Cálculo de IMC se disponível
    let imc = null;
    if (dados.peso && dados.altura) {
        imc = dados.peso / Math.pow(dados.altura / 100, 2);
        if (imc < 16 || imc > 40) {
            pontuacao += 20;
            fatoresRisco.push(`IMC crítico: ${imc.toFixed(1)}`);
        }
    }
    
    // Determinação da prioridade final (ajustada)
    let prioridade;
    const numCriticos = fatoresCriticos.length;
    
    if (pontuacao >= 120 || numCriticos >= 2) {
        prioridade = 'EMERGÊNCIA';
    } else if (pontuacao >= 80 || numCriticos === 1) {
        prioridade = 'MUITO URGENTE';
    } else if (pontuacao >= 50) {
        prioridade = 'URGENTE';
    } else if (pontuacao >= 25) {
        prioridade = 'POUCO URGENTE';
    } else {
        prioridade = 'NÃO URGENTE';
    }
    
    return {
        prioridade,
        pontuacao,
        fatoresRisco: fatoresRisco.filter(f => f && f.trim() !== ''),
        fatoresCriticos: fatoresCriticos.filter(f => f && f.trim() !== ''),
        imc
    };
}

// Inicializar banco de dados e iniciar servidor
async function startServer() {
    try {
        console.log('🚀 Iniciando servidor...');
        
        // Inicializar conexão com MongoDB
        const dbConnected = await initDatabase();
        if (!dbConnected) {
            console.error('❌ Falha ao conectar com o banco de dados. Encerrando...');
            process.exit(1);
        }
        
        // Iniciar servidor
        app.listen(port, () => {
            console.log(`🚀 Servidor rodando na porta ${port}`);
            console.log(`📊 API de Triagem disponível em http://localhost:${port}/api/triagens`);
            console.log(`🌐 Interface web disponível em http://localhost:${port}`);
            console.log(`🗄️  Banco de dados: MongoDB`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Iniciar servidor
startServer();
