// Arquivo: transferir_chats.js

// --- INÍCIO DA CONFIGURAÇÃO ---

// URL de onde vamos buscar os dados
const sourceUrl = 'https://kentro.atenderbem.com/int/getAllOpenChats';

// URL do webhook para onde vamos enviar os dados
const webhookUrl = 'https://webhook.iagende.com.br/webhook/267b7c15-d527-49e7-ac1e-c7f6a6280dba';

// Parâmetros para a requisição inicial.
// IMPORTANTE: Substitua "string" pela sua chave de API real.
const requestParams = {
  queueId: 46,
  apiKey: "123" // <-- TROQUE AQUI
};

// --- FIM DA CONFIGURAÇÃO ---


/**
 * Função principal que busca os dados e os envia para o webhook.
 * Ela é 'async' para podermos usar 'await' e tornar o código mais legível.
 */
async function transferOpenChats() {
  console.log('Iniciando o processo de transferência de chats...');

  try {
    // ETAPA 1: Puxar todos os dados da fonte
    console.log(`Buscando dados de: ${sourceUrl}`);

    const responseStep1 = await fetch(sourceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestParams),
    });

    // Verifica se a primeira requisição foi bem-sucedida
    if (!responseStep1.ok) {
      // Se não for bem-sucedida, lança um erro com o status
      throw new Error(`Erro ao buscar dados: ${responseStep1.status} ${responseStep1.statusText}`);
    }

    // Converte a resposta para JSON
    const openChatsData = await responseStep1.json();
    console.log('Dados recebidos com sucesso!', openChatsData);

    // ETAPA 2: Enviar os dados capturados para o webhook
    console.log(`Enviando dados para o webhook: ${webhookUrl}`);

    const responseStep2 = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // O corpo da segunda requisição é o resultado completo da primeira
      body: JSON.stringify(openChatsData),
    });

    // Verifica se a segunda requisição foi bem-sucedida
    if (!responseStep2.ok) {
      throw new Error(`Erro ao enviar para o webhook: ${responseStep2.status} ${responseStep2.statusText}`);
    }
    
    // Se tudo deu certo, exibe uma mensagem de sucesso
    console.log('Dados enviados para o webhook com sucesso!');
    const webhookResponse = await responseStep2.text(); // ou .json() se o webhook retornar json
    console.log('Resposta do webhook:', webhookResponse);


  } catch (error) {
    // Captura qualquer erro que tenha ocorrido no processo
    console.error('Ocorreu um erro durante a execução:', error.message);
  }
}

// Executa a função principal
transferOpenChats();