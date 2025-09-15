// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Estado da fila
let filaOrdenada = [];
let pacienteAtual = null;

document.addEventListener('DOMContentLoaded', () => {
    const btnProximo = document.getElementById('btnProximo');
    btnProximo.disabled = true;
    document.getElementById('btnAtualizar').addEventListener('click', carregarFila);
    document.getElementById('btnProximo').addEventListener('click', chamarProximo);
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

function chamarProximo() {
    const btnProximo = document.getElementById('btnProximo');
    btnProximo.disabled = true;
    if (!filaOrdenada.length) {
        pacienteAtual = null;
        atualizarPainelAtual();
        mostrarAvisoFilaVazia();
        return;
    }
    pacienteAtual = filaOrdenada.shift();
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


