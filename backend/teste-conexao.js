const { connectToMongoDB, disconnectFromMongoDB } = require('./mongodb-config');

async function testeConexao() {
    console.log('🔍 Testando conexão com MongoDB...\n');
    
    try {
        // Tentar conectar
        const conectado = await connectToMongoDB();
        
        if (conectado) {
            console.log('✅ CONEXÃO ESTABELECIDA COM SUCESSO!');
            console.log('✅ MongoDB está funcionando corretamente!\n');
            
            // Aguardar 2 segundos e desconectar
            console.log('🔌 Desconectando...');
            await disconnectFromMongoDB();
            console.log('✅ Desconectado com sucesso!');
        } else {
            console.log('❌ FALHA NA CONEXÃO!');
            console.log('❌ Verifique se o MongoDB está rodando');
            console.log('❌ Verifique a string de conexão no arquivo mongodb-config.js');
        }
    } catch (error) {
        console.error('❌ ERRO:', error.message);
        console.log('\n🔧 Possíveis soluções:');
        console.log('1. Verifique se o MongoDB está instalado e rodando');
        console.log('2. Verifique a string de conexão no arquivo mongodb-config.js');
        console.log('3. Verifique se a porta 27017 está disponível');
    }
    
    process.exit(0);
}

testeConexao();
