require('dotenv').config();
const mongoose = require('mongoose');

// Configuração de conexão com MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ Erro: MONGODB_URI não está definida no arquivo .env');
    process.exit(1);
}

// Opções de conexão
const options = {
    maxPoolSize: 10, // Manter até 10 conexões no pool
    serverSelectionTimeoutMS: 5000, // Manter tentando enviar operações por 5 segundos
    socketTimeoutMS: 45000, // Fechar sockets após 45 segundos de inatividade
};

// Função para conectar ao MongoDB
async function connectToMongoDB() {
    try {
        await mongoose.connect(MONGODB_URI, options);
        console.log('✅ Conectado ao MongoDB com sucesso!');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com MongoDB:', error.message);
        return false;
    }
}

// Função para desconectar do MongoDB
async function disconnectFromMongoDB() {
    try {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
        return true;
    } catch (error) {
        console.error('❌ Erro ao desconectar do MongoDB:', error.message);
        return false;
    }
}

// Eventos de conexão
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose conectado ao MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Erro na conexão Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose desconectado do MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await disconnectFromMongoDB();
    process.exit(0);
});

module.exports = {
    connectToMongoDB,
    disconnectFromMongoDB,
    mongoose
};
