// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Configuração do webhook
const WEBHOOK_URL = 'https://webhook.iagende.com.br/webhook/a176faa1-6179-483a-b1d5-e4f0ea9252df';

// Estado da fila
let filaOrdenada = [];
let pacienteAtual = null;

document.addEventListener('DOMContentLoaded', () => {
    const btnProximo = document.getElementById('btnProximo');
    btnProximo.disabled = true;
    document.getElementById('btnAtualizar').addEventListener('click', carregarFila);
    document.getElementById('btnProximo').addEventListener('click', chamarProximo);
    document.getElementById('btnTestarWebhook').addEventListener('click', testarWebhookCompleto);
    carregarFila();
});

async function carregarFila() {
    try {
        toggleProximo(false);
        const params = new URLSearchParams({ page: 1, limit: 100 });
        const response = await fetch(`${API_BASE_URL}/triagens?${params}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Falha ao carregar triagens');

        const registros = data.data || [];

        // Ordenação por prioridade e depois por data (mais antigo primeiro)
        const prioridadePeso = {
            'EMERGÊNCIA': 5,
            'MUITO URGENTE': 4,
            'URGENTE': 3,
            'POUCO URGENTE': 2,
            'NÃO URGENTE': 1
        };

        filaOrdenada = registros
            .slice()
            .sort((a, b) => {
                const pa = prioridadePeso[a.prioridade] || 0;
                const pb = prioridadePeso[b.prioridade] || 0;
                if (pb !== pa) return pb - pa;
                const da = new Date(a.dataTriagem).getTime();
                const db = new Date(b.dataTriagem).getTime();
                return da - db;
            });

        renderizarFila();
        toggleProximo(filaOrdenada.length > 0);
    } catch (err) {
        console.error('Erro ao carregar fila:', err);
        const tbody = document.getElementById('tbodyFila');
        tbody.innerHTML = `<tr><td colspan="5" class="alert alert-error">Erro ao carregar fila</td></tr>`;
        toggleProximo(false);
    }
}

function renderizarFila() {
    const tbody = document.getElementById('tbodyFila');
    if (!filaOrdenada.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Nenhum paciente na fila</td></tr>`;
        return;
    }

    tbody.innerHTML = filaOrdenada.map((t, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${t.nome}</td>
            <td><span class="priority-badge priority-${getPriorityClass(t.prioridade)}">${t.prioridade}</span></td>
            <td>${t.pontuacao}</td>
            <td>${formatarData(t.dataTriagem)}</td>
        </tr>
    `).join('');

    atualizarPainelAtual();
}

// Função para testar conectividade do webhook
async function testarWebhook() {
    try {
        console.log('🧪 Testando conectividade do webhook...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Sistema-Triagem-Test-v1.0'
            }
        });
        
        clearTimeout(timeoutId);
        console.log('✅ Webhook acessível - Status:', response.status);
        return true;
        
    } catch (error) {
        console.warn('⚠️ Webhook não acessível:', error.message);
        return false;
    }
}

// Função para testar webhook com dados de exemplo
async function testarWebhookCompleto() {
    const btnTeste = document.getElementById('btnTestarWebhook');
    const textoOriginal = btnTeste.textContent;
    
    try {
        btnTeste.disabled = true;
        btnTeste.textContent = '🔄 Testando...';
        
        console.log('🧪 Iniciando teste completo do webhook...');
        mostrarNotificacao('Testando conectividade do webhook...', 'info');
        
        // Dados de teste
        const dadosTeste = {
            evento: 'TESTE_WEBHOOK',
            timestamp: new Date().toISOString(),
            teste: true,
            paciente: {
                id: 'teste-123',
                nome: 'Paciente Teste',
                prioridade: 'TESTE',
                pontuacao: 0,
                idade: 30,
                genero: 'teste',
                queixaPrincipal: 'Teste de conectividade',
                dataTriagem: new Date().toISOString(),
                sinaisVitais: {
                    frequenciaCardiaca: 75,
                    frequenciaRespiratoria: 16,
                    temperatura: 36.5,
                    pressaoSistolica: 120,
                    pressaoDiastolica: 80,
                    saturacaoOxigenio: 98
                },
                fatoresRisco: ['Teste'],
                fatoresCriticos: []
            }
        };
        
        console.log('📤 Enviando dados de teste:', dadosTeste);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Sistema-Triagem-Test-v1.0',
                'X-Source': 'teste-painel-triagem'
            },
            body: JSON.stringify(dadosTeste)
        });
        
        clearTimeout(timeoutId);
        
        console.log('📥 Resposta do teste:', response.status, response.statusText);
        
        if (response.ok) {
            const responseData = await response.text();
            console.log('✅ Teste bem-sucedido:', responseData);
            mostrarNotificacao('✅ Webhook funcionando corretamente!', 'success');
        } else {
            const errorData = await response.text();
            console.error('❌ Teste falhou:', response.status, errorData);
            mostrarNotificacao(`❌ Teste falhou: ${response.status} - ${errorData}`, 'error');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        let mensagem = 'Erro no teste de conectividade';
        
        if (error.name === 'AbortError') {
            mensagem = 'Timeout - Webhook não respondeu em 10s';
        } else if (error.message.includes('Failed to fetch')) {
            mensagem = 'Erro de rede - Verifique a URL do webhook';
        } else {
            mensagem = error.message;
        }
        
        mostrarNotificacao(`❌ ${mensagem}`, 'error');
    } finally {
        btnTeste.disabled = false;
        btnTeste.textContent = textoOriginal;
    }
}

// Função para enviar dados do paciente para o webhook
async function enviarDadosWebhook(paciente) {
    try {
        console.log('Enviando dados do paciente para webhook:', paciente.nome);
        
        // Preparar dados para envio
        const dadosWebhook = {
            evento: 'CHAMADA_PACIENTE',
            timestamp: new Date().toISOString(),
            paciente: {
                id: paciente.id || paciente._id,
                nome: paciente.nome,
                prioridade: paciente.prioridade,
                pontuacao: paciente.pontuacao,
                idade: paciente.idade,
                genero: paciente.genero,
                queixaPrincipal: paciente.queixaPrincipal,
                dataTriagem: paciente.dataTriagem,
                sinaisVitais: {
                    frequenciaCardiaca: paciente.frequenciaCardiaca,
                    frequenciaRespiratoria: paciente.frequenciaRespiratoria,
                    temperatura: paciente.temperatura,
                    pressaoSistolica: paciente.pressaoSistolica,
                    pressaoDiastolica: paciente.pressaoDiastolica,
                    saturacaoOxigenio: paciente.saturacaoOxigenio
                },
                fatoresRisco: paciente.fatoresRisco || [],
                fatoresCriticos: paciente.fatoresCriticos || []
            }
        };
        
        // Fazer requisição para o webhook com timeout
        console.log('🔄 Enviando para URL:', WEBHOOK_URL);
        console.log('📤 Dados sendo enviados:', dadosWebhook);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Sistema-Triagem-v1.0',
                'X-Source': 'painel-triagem'
            },
            body: JSON.stringify(dadosWebhook)
        });
        
        clearTimeout(timeoutId);
        
        console.log('📥 Status da resposta:', response.status, response.statusText);
        
        if (response.ok) {
            const responseData = await response.text();
            console.log('✅ Webhook respondeu com sucesso:', responseData);
            mostrarNotificacao('Dados enviados com sucesso!', 'success');
        } else {
            // Tentar ler a resposta de erro
            let errorMessage = '';
            try {
                const errorData = await response.text();
                console.error('❌ Resposta de erro do webhook:', errorData);
                errorMessage = errorData || `Status ${response.status}`;
            } catch (e) {
                errorMessage = `Status ${response.status} - ${response.statusText}`;
            }
            
            console.warn('⚠️ Webhook falhou:', response.status, response.statusText);
            mostrarNotificacao(`Erro no webhook: ${errorMessage}`, 'error');
        }
        
    } catch (error) {
        console.error('❌ Erro de rede ao enviar para webhook:', error);
        
        // Verificar tipo específico de erro
        let mensagemErro = 'Falha na comunicação';
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            mensagemErro = 'Erro de conectividade - verifique a URL';
        } else if (error.name === 'AbortError') {
            mensagemErro = 'Timeout na requisição';
        } else {
            mensagemErro = error.message || 'Erro desconhecido';
        }
        
        mostrarNotificacao(`Erro: ${mensagemErro}`, 'error');
    }
}

async function chamarProximo() {
    const btnProximo = document.getElementById('btnProximo');
    btnProximo.disabled = true;
    
    if (!filaOrdenada.length) {
        pacienteAtual = null;
        atualizarPainelAtual();
        mostrarAvisoFilaVazia();
        return;
    }
    
    // Pegar o próximo paciente da fila
    pacienteAtual = filaOrdenada.shift();
    
    // Enviar dados para o webhook
    await enviarDadosWebhook(pacienteAtual);
    
    // Atualizar interface
    renderizarFila();
    toggleProximo(filaOrdenada.length > 0);
}

function atualizarPainelAtual() {
    const box = document.getElementById('pacienteAtualBox');
    const vazio = document.getElementById('semPacienteAtual');
    const nome = document.getElementById('pacienteAtualNome');
    const info = document.getElementById('pacienteAtualInfo');

    if (pacienteAtual) {
        box.style.display = 'block';
        vazio.style.display = 'none';
        nome.textContent = pacienteAtual.nome;
        info.textContent = `${pacienteAtual.prioridade} • Pontuação ${pacienteAtual.pontuacao}`;
    } else {
        box.style.display = 'none';
        vazio.style.display = 'block';
        nome.textContent = '-';
        info.textContent = '-';
    }
}

function toggleProximo(habilitar) {
    const btnProximo = document.getElementById('btnProximo');
    btnProximo.disabled = !habilitar;
}

function mostrarAvisoFilaVazia() {
    const tbody = document.getElementById('tbodyFila');
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Fila vazia. Clique em "Atualizar fila".</td></tr>`;
}

function getPriorityClass(prioridade) {
    const classes = {
        'EMERGÊNCIA': 'emergency',
        'MUITO URGENTE': 'urgent',
        'URGENTE': 'moderate',
        'POUCO URGENTE': 'low',
        'NÃO URGENTE': 'normal'
    };
    return classes[prioridade] || 'normal';
}

function formatarData(data) {
    return new Date(data).toLocaleString('pt-BR');
}

// Função para mostrar notificações ao usuário
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação se não existir
    let notificacao = document.getElementById('notificacao-webhook');
    if (!notificacao) {
        notificacao = document.createElement('div');
        notificacao.id = 'notificacao-webhook';
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            font-size: 14px;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            transform: translateX(100%);
        `;
        document.body.appendChild(notificacao);
    }
    
    // Definir cores baseadas no tipo
    const cores = {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
    };
    
    // Configurar notificação
    notificacao.textContent = mensagem;
    notificacao.style.backgroundColor = cores[tipo] || cores.info;
    notificacao.style.transform = 'translateX(0)';
    
    // Remover após 4 segundos
    setTimeout(() => {
        notificacao.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 300);
    }, 4000);
}


