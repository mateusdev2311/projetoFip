const { initDatabase, closeDatabase, Triagem, HistoricoTriagem, Configuracao } = require('./database');

async function testMongoDBConnection() {
    console.log('🧪 Iniciando testes de conexão MongoDB...\n');
    
    try {
        // 1. Testar conexão
        console.log('1️⃣ Testando conexão com MongoDB...');
        const connected = await initDatabase();
        
        if (!connected) {
            throw new Error('Falha ao conectar com MongoDB');
        }
        console.log('✅ Conexão estabelecida com sucesso!\n');
        
        // 2. Testar criação de triagem
        console.log('2️⃣ Testando criação de triagem...');
        const triagemTeste = {
            _id: 'teste-123',
            nome: 'João Silva',
            idade: 35,
            genero: 'masculino',
            peso: 75,
            altura: 175,
            frequenciaCardiaca: 80,
            frequenciaRespiratoria: 16,
            temperatura: 36.5,
            pressaoSistolica: 120,
            pressaoDiastolica: 80,
            saturacaoOxigenio: 98,
            nivelConsciencia: 'alerta',
            orientacao: 'orientado',
            intensidadeDor: 3,
            queixaPrincipal: 'Dor de cabeça',
            tempoSintomas: '2 horas',
            sintomas: ['dor-cabeca', 'nausea'],
            doencas: ['hipertensao'],
            prioridade: 'URGENTE',
            pontuacao: 45,
            fatoresRisco: ['Hipertensão arterial'],
            fatoresCriticos: [],
            imc: 24.5
        };
        
        const triagemCriada = await Triagem.create(triagemTeste);
        console.log('✅ Triagem criada com sucesso!');
        console.log(`   ID: ${triagemCriada._id}`);
        console.log(`   Nome: ${triagemCriada.nome}`);
        console.log(`   Prioridade: ${triagemCriada.prioridade}\n`);
        
        // 3. Testar busca de triagem
        console.log('3️⃣ Testando busca de triagem...');
        const triagemEncontrada = await Triagem.findById('teste-123');
        
        if (triagemEncontrada) {
            console.log('✅ Triagem encontrada com sucesso!');
            console.log(`   Nome: ${triagemEncontrada.nome}`);
            console.log(`   Idade: ${triagemEncontrada.idade}`);
        } else {
            throw new Error('Triagem não encontrada');
        }
        console.log();
        
        // 4. Testar histórico
        console.log('4️⃣ Testando registro de histórico...');
        await HistoricoTriagem.registrarHistorico(
            'teste-123',
            'CRIACAO',
            null,
            triagemTeste
        );
        console.log('✅ Histórico registrado com sucesso!\n');
        
        // 5. Testar estatísticas
        console.log('5️⃣ Testando estatísticas...');
        const stats = await Triagem.getStats();
        console.log('✅ Estatísticas obtidas com sucesso!');
        console.log(`   Total de triagens: ${stats.estatisticas.total_triagens}`);
        console.log(`   Emergências: ${stats.estatisticas.emergencias}`);
        console.log(`   Pontuação média: ${stats.estatisticas.pontuacao_media?.toFixed(2) || 'N/A'}\n`);
        
        // 6. Testar paginação
        console.log('6️⃣ Testando paginação...');
        const resultadoPaginacao = await Triagem.findWithPagination({}, {
            page: 1,
            limit: 5,
            sortBy: 'dataTriagem',
            sortOrder: 'desc'
        });
        console.log('✅ Paginação funcionando!');
        console.log(`   Página: ${resultadoPaginacao.pagination.page}`);
        console.log(`   Total: ${resultadoPaginacao.pagination.total}`);
        console.log(`   Páginas: ${resultadoPaginacao.pagination.pages}\n`);
        
        // 7. Testar configurações
        console.log('7️⃣ Testando configurações...');
        const config = await Configuracao.findOne({ chave: 'versao_sistema' });
        if (config) {
            console.log('✅ Configurações funcionando!');
            console.log(`   Versão: ${config.valor}`);
        }
        console.log();
        
        // 8. Limpeza
        console.log('8️⃣ Limpando dados de teste...');
        await Triagem.findByIdAndDelete('teste-123');
        await HistoricoTriagem.deleteMany({ triagem_id: 'teste-123' });
        console.log('✅ Dados de teste removidos!\n');
        
        console.log('🎉 Todos os testes passaram com sucesso!');
        console.log('✅ MongoDB está funcionando corretamente!');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        // Fechar conexão
        await closeDatabase();
        console.log('\n🔌 Conexão fechada.');
        process.exit(0);
    }
}

// Executar testes
testMongoDBConnection();
