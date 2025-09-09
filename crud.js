// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

// Estado global
let triagens = [];
let triagemAtual = null;
let paginaAtual = 1;
let totalPaginas = 1;
let filtros = {
    search: '',
    prioridade: '',
    data_inicio: '',
    data_fim: ''
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarTriagens();
    carregarEstatisticas();
    configurarEventListeners();
});

// Configurar event listeners
function configurarEventListeners() {
    // Filtros
    document.getElementById('filtroBusca').addEventListener('input', function() {
        filtros.search = this.value;
        if (this.value.length >= 3 || this.value.length === 0) {
            aplicarFiltros();
        }
    });

    document.getElementById('filtroPrioridade').addEventListener('change', function() {
        filtros.prioridade = this.value;
        aplicarFiltros();
    });

    document.getElementById('filtroDataInicio').addEventListener('change', function() {
        filtros.data_inicio = this.value;
        aplicarFiltros();
    });

    document.getElementById('filtroDataFim').addEventListener('change', function() {
        filtros.data_fim = this.value;
        aplicarFiltros();
    });

    // Fechar modal ao clicar fora
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modalTriagem');
        const modalVisualizar = document.getElementById('modalVisualizar');
        if (event.target === modal) {
            fecharModal();
        }
        if (event.target === modalVisualizar) {
            fecharModalVisualizar();
        }
    });
}

// ==================== FUNÇÕES DE CARREGAMENTO ====================

async function carregarTriagens() {
    try {
        mostrarLoading(true);
        
        const params = new URLSearchParams({
            page: paginaAtual,
            limit: 10,
            ...filtros
        });

        const response = await fetch(`${API_BASE_URL}/triagens?${params}`);
        const data = await response.json();

        if (data.success) {
            triagens = data.data;
            totalPaginas = data.pagination.pages;
            renderizarTabela();
            renderizarPaginacao();
        } else {
            mostrarErro('Erro ao carregar triagens: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar triagens:', error);
        mostrarErro('Erro de conexão com o servidor');
    } finally {
        mostrarLoading(false);
    }
}

async function carregarEstatisticas() {
    try {
        const response = await fetch(`${API_BASE_URL}/triagens/stats/geral`);
        const data = await response.json();

        if (data.success) {
            const stats = data.data.estatisticas;
            document.getElementById('totalTriagens').textContent = stats.total_triagens || 0;
            document.getElementById('totalEmergencias').textContent = stats.emergencias || 0;
            document.getElementById('totalUrgentes').textContent = stats.muito_urgentes || 0;
            document.getElementById('totalModerados').textContent = stats.urgentes || 0;
            document.getElementById('totalBaixos').textContent = stats.pouco_urgentes || 0;
            document.getElementById('totalNormais').textContent = stats.nao_urgentes || 0;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// ==================== FUNÇÕES DE RENDERIZAÇÃO ====================

function renderizarTabela() {
    const tbody = document.getElementById('triagensTableBody');
    
    if (triagens.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <h3>Nenhuma triagem encontrada</h3>
                    <p>Não há registros que correspondam aos filtros aplicados.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = triagens.map(triagem => `
        <tr>
            <td>${triagem.id.substring(0, 8)}...</td>
            <td>${triagem.nome}</td>
            <td>${triagem.idade} anos</td>
            <td>${triagem.genero}</td>
            <td>
                <span class="priority-badge priority-${getPriorityClass(triagem.prioridade)}">
                    ${triagem.prioridade}
                </span>
            </td>
            <td>${triagem.pontuacao}</td>
            <td>${formatarData(triagem.dataTriagem)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="visualizarTriagem('${triagem.id}')" title="Visualizar">
                        👁️
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editarTriagem('${triagem.id}')" title="Editar">
                        ✏️
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmarExclusao('${triagem.id}', '${triagem.nome}')" title="Excluir">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderizarPaginacao() {
    const pagination = document.getElementById('pagination');
    
    if (totalPaginas <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    // Botão anterior
    paginationHTML += `
        <button ${paginaAtual === 1 ? 'disabled' : ''} onclick="irParaPagina(${paginaAtual - 1})">
            ← Anterior
        </button>
    `;

    // Páginas
    const inicio = Math.max(1, paginaAtual - 2);
    const fim = Math.min(totalPaginas, paginaAtual + 2);

    if (inicio > 1) {
        paginationHTML += `<button onclick="irParaPagina(1)">1</button>`;
        if (inicio > 2) {
            paginationHTML += `<span>...</span>`;
        }
    }

    for (let i = inicio; i <= fim; i++) {
        paginationHTML += `
            <button class="${i === paginaAtual ? 'active' : ''}" onclick="irParaPagina(${i})">
                ${i}
            </button>
        `;
    }

    if (fim < totalPaginas) {
        if (fim < totalPaginas - 1) {
            paginationHTML += `<span>...</span>`;
        }
        paginationHTML += `<button onclick="irParaPagina(${totalPaginas})">${totalPaginas}</button>`;
    }

    // Botão próximo
    paginationHTML += `
        <button ${paginaAtual === totalPaginas ? 'disabled' : ''} onclick="irParaPagina(${paginaAtual + 1})">
            Próximo →
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

// ==================== FUNÇÕES DE NAVEGAÇÃO ====================

function irParaPagina(pagina) {
    if (pagina >= 1 && pagina <= totalPaginas) {
        paginaAtual = pagina;
        carregarTriagens();
    }
}

function aplicarFiltros() {
    paginaAtual = 1;
    carregarTriagens();
}

// ==================== FUNÇÕES DE MODAL ====================

function abrirModalNovaTriagem() {
    triagemAtual = null;
    document.getElementById('modalTitle').textContent = 'Nova Triagem';
    document.getElementById('modalSaveBtn').textContent = 'Criar Triagem';
    carregarFormularioModal();
    document.getElementById('modalTriagem').style.display = 'block';
}

function editarTriagem(id) {
    triagemAtual = triagens.find(t => t.id === id);
    if (!triagemAtual) {
        mostrarErro('Triagem não encontrada');
        return;
    }

    document.getElementById('modalTitle').textContent = 'Editar Triagem';
    document.getElementById('modalSaveBtn').textContent = 'Atualizar Triagem';
    carregarFormularioModal();
    document.getElementById('modalTriagem').style.display = 'block';
}

function carregarFormularioModal() {
    const form = document.getElementById('modalForm');
    
    // Se for nova triagem, redirecionar para o formulário principal
    if (!triagemAtual) {
        form.innerHTML = `
            <div class="alert alert-info">
                <strong>Nova Triagem</strong><br>
                Para criar uma nova triagem, use o formulário completo de triagem.
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <a href="index.html" class="btn btn-primary">Ir para Formulário de Triagem</a>
            </div>
        `;
        return;
    }

    // Formulário de edição simplificado
    form.innerHTML = `
        <div class="form-group">
            <label for="modalNome">Nome Completo *</label>
            <input type="text" id="modalNome" value="${triagemAtual.nome}" required>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group">
                <label for="modalIdade">Idade *</label>
                <input type="number" id="modalIdade" value="${triagemAtual.idade}" min="0" max="120" required>
            </div>
            <div class="form-group">
                <label for="modalGenero">Gênero *</label>
                <select id="modalGenero" required>
                    <option value="masculino" ${triagemAtual.genero === 'masculino' ? 'selected' : ''}>Masculino</option>
                    <option value="feminino" ${triagemAtual.genero === 'feminino' ? 'selected' : ''}>Feminino</option>
                    <option value="outro" ${triagemAtual.genero === 'outro' ? 'selected' : ''}>Outro</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label for="modalQueixa">Queixa Principal *</label>
            <textarea id="modalQueixa" rows="3" required>${triagemAtual.queixaPrincipal || ''}</textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group">
                <label for="modalFC">Frequência Cardíaca (bpm) *</label>
                <input type="number" id="modalFC" value="${triagemAtual.frequenciaCardiaca}" min="30" max="250" required>
            </div>
            <div class="form-group">
                <label for="modalFR">Frequência Respiratória (rpm) *</label>
                <input type="number" id="modalFR" value="${triagemAtual.frequenciaRespiratoria}" min="5" max="60" required>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group">
                <label for="modalPAS">Pressão Sistólica (mmHg) *</label>
                <input type="number" id="modalPAS" value="${triagemAtual.pressaoSistolica}" min="50" max="250" required>
            </div>
            <div class="form-group">
                <label for="modalPAD">Pressão Diastólica (mmHg) *</label>
                <input type="number" id="modalPAD" value="${triagemAtual.pressaoDiastolica}" min="30" max="150" required>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group">
                <label for="modalTemp">Temperatura (°C) *</label>
                <input type="number" id="modalTemp" value="${triagemAtual.temperatura}" step="0.1" min="30" max="45" required>
            </div>
            <div class="form-group">
                <label for="modalSpO2">Saturação de Oxigênio (%) *</label>
                <input type="number" id="modalSpO2" value="${triagemAtual.saturacaoOxigenio}" min="50" max="100" required>
            </div>
        </div>

        <div class="form-group">
            <label for="modalConsciencia">Nível de Consciência *</label>
            <select id="modalConsciencia" required>
                <option value="alerta" ${triagemAtual.nivelConsciencia === 'alerta' ? 'selected' : ''}>Alerta (A)</option>
                <option value="resposta-verbal" ${triagemAtual.nivelConsciencia === 'resposta-verbal' ? 'selected' : ''}>Resposta Verbal (V)</option>
                <option value="resposta-dor" ${triagemAtual.nivelConsciencia === 'resposta-dor' ? 'selected' : ''}>Resposta à Dor (D)</option>
                <option value="inconsciente" ${triagemAtual.nivelConsciencia === 'inconsciente' ? 'selected' : ''}>Inconsciente (I)</option>
            </select>
        </div>

        <div class="form-group">
            <label for="modalObservacoes">Observações</label>
            <textarea id="modalObservacoes" rows="3">${triagemAtual.observacoes || ''}</textarea>
        </div>
    `;
}

function fecharModal() {
    document.getElementById('modalTriagem').style.display = 'none';
    document.getElementById('modalAlert').innerHTML = '';
}

function visualizarTriagem(id) {
    const triagem = triagens.find(t => t.id === id);
    if (!triagem) {
        mostrarErro('Triagem não encontrada');
        return;
    }

    // Carregar dados completos da triagem
    carregarTriagemCompleta(id);
}

async function carregarTriagemCompleta(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/triagens/${id}`);
        const data = await response.json();

        if (data.success) {
            const triagem = data.data;
            mostrarModalVisualizacao(triagem);
        } else {
            mostrarErro('Erro ao carregar detalhes da triagem');
        }
    } catch (error) {
        console.error('Erro ao carregar triagem:', error);
        mostrarErro('Erro de conexão com o servidor');
    }
}

function mostrarModalVisualizacao(triagem) {
    const modalBody = document.getElementById('modalVisualizarBody');
    
    modalBody.innerHTML = `
        <div class="alert alert-${getPriorityClass(triagem.prioridade)}">
            <strong>Prioridade: ${triagem.prioridade}</strong><br>
            Pontuação: ${triagem.pontuacao}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                <h4>👤 Dados Pessoais</h4>
                <p><strong>Nome:</strong> ${triagem.nome}</p>
                <p><strong>Idade:</strong> ${triagem.idade} anos</p>
                <p><strong>Gênero:</strong> ${triagem.genero}</p>
                ${triagem.peso ? `<p><strong>Peso:</strong> ${triagem.peso} kg</p>` : ''}
                ${triagem.altura ? `<p><strong>Altura:</strong> ${triagem.altura} cm</p>` : ''}
                ${triagem.imc ? `<p><strong>IMC:</strong> ${triagem.imc.toFixed(1)} kg/m²</p>` : ''}
            </div>
            
            <div>
                <h4>💓 Sinais Vitais</h4>
                <p><strong>FC:</strong> ${triagem.frequenciaCardiaca} bpm</p>
                <p><strong>FR:</strong> ${triagem.frequenciaRespiratoria} rpm</p>
                <p><strong>PA:</strong> ${triagem.pressaoSistolica}/${triagem.pressaoDiastolica} mmHg</p>
                <p><strong>Temp:</strong> ${triagem.temperatura}°C</p>
                <p><strong>SpO2:</strong> ${triagem.saturacaoOxigenio}%</p>
                <p><strong>Consciência:</strong> ${triagem.nivelConsciencia}</p>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4>🩺 Queixa e Sintomas</h4>
            <p><strong>Queixa Principal:</strong> ${triagem.queixaPrincipal}</p>
            <p><strong>Tempo dos Sintomas:</strong> ${triagem.tempoSintomas}</p>
            ${triagem.intensidadeDor > 0 ? `<p><strong>Intensidade da Dor:</strong> ${triagem.intensidadeDor}/10</p>` : ''}
            ${triagem.localizacaoDor ? `<p><strong>Localização da Dor:</strong> ${triagem.localizacaoDor}</p>` : ''}
        </div>

        ${triagem.observacoes ? `
        <div style="margin-bottom: 20px;">
            <h4>📝 Observações</h4>
            <p>${triagem.observacoes}</p>
        </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <h4>📅 Informações do Registro</h4>
                <p><strong>Data da Triagem:</strong> ${formatarDataCompleta(triagem.dataTriagem)}</p>
                <p><strong>Última Atualização:</strong> ${formatarDataCompleta(triagem.dataAtualizacao)}</p>
                <p><strong>ID:</strong> ${triagem.id}</p>
            </div>
            
            <div>
                <h4>⚠️ Fatores de Risco</h4>
                ${triagem.fatoresRisco && triagem.fatoresRisco.length > 0 ? 
                    '<ul>' + triagem.fatoresRisco.map(fator => `<li>${fator}</li>`).join('') + '</ul>' :
                    '<p>Nenhum fator de risco identificado.</p>'
                }
            </div>
        </div>

        ${triagem.fatoresCriticos && triagem.fatoresCriticos.length > 0 ? `
        <div style="margin-top: 20px;">
            <h4>🚨 Fatores Críticos</h4>
            <ul style="color: #c62828;">
                ${triagem.fatoresCriticos.map(fator => `<li>${fator}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    `;

    document.getElementById('modalVisualizar').style.display = 'block';
}

function fecharModalVisualizar() {
    document.getElementById('modalVisualizar').style.display = 'none';
}

// ==================== FUNÇÕES DE CRUD ====================

async function salvarTriagem() {
    if (!triagemAtual) {
        // Redirecionar para o formulário principal para nova triagem
        window.location.href = 'index.html';
        return;
    }

    try {
        const dadosAtualizacao = {
            nome: document.getElementById('modalNome').value,
            idade: parseInt(document.getElementById('modalIdade').value),
            genero: document.getElementById('modalGenero').value,
            queixaPrincipal: document.getElementById('modalQueixa').value,
            frequenciaCardiaca: parseInt(document.getElementById('modalFC').value),
            frequenciaRespiratoria: parseInt(document.getElementById('modalFR').value),
            pressaoSistolica: parseInt(document.getElementById('modalPAS').value),
            pressaoDiastolica: parseInt(document.getElementById('modalPAD').value),
            temperatura: parseFloat(document.getElementById('modalTemp').value),
            saturacaoOxigenio: parseInt(document.getElementById('modalSpO2').value),
            nivelConsciencia: document.getElementById('modalConsciencia').value,
            observacoes: document.getElementById('modalObservacoes').value
        };

        const response = await fetch(`${API_BASE_URL}/triagens/${triagemAtual.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosAtualizacao)
        });

        const data = await response.json();

        if (data.success) {
            mostrarSucesso('Triagem atualizada com sucesso!');
            fecharModal();
            carregarTriagens();
            carregarEstatisticas();
        } else {
            mostrarErro('Erro ao atualizar triagem: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao salvar triagem:', error);
        mostrarErro('Erro de conexão com o servidor');
    }
}

function confirmarExclusao(id, nome) {
    if (confirm(`Tem certeza que deseja excluir a triagem de ${nome}?\n\nEsta ação não pode ser desfeita.`)) {
        excluirTriagem(id);
    }
}

async function excluirTriagem(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/triagens/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            mostrarSucesso('Triagem excluída com sucesso!');
            carregarTriagens();
            carregarEstatisticas();
        } else {
            mostrarErro('Erro ao excluir triagem: ' + data.message);
        }
    } catch (error) {
        console.error('Erro ao excluir triagem:', error);
        mostrarErro('Erro de conexão com o servidor');
    }
}

// ==================== FUNÇÕES AUXILIARES ====================

function mostrarLoading(mostrar) {
    const tbody = document.getElementById('triagensTableBody');
    if (mostrar) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="loading">
                    Carregando triagens...
                </td>
            </tr>
        `;
    }
}

function mostrarSucesso(mensagem) {
    mostrarAlerta(mensagem, 'success');
}

function mostrarErro(mensagem) {
    mostrarAlerta(mensagem, 'error');
}

function mostrarAlerta(mensagem, tipo) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo}`;
    alertDiv.innerHTML = mensagem;
    
    // Inserir no topo da página
    const container = document.querySelector('.crud-container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Remover após 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function mostrarAlertaModal(mensagem, tipo) {
    const modalAlert = document.getElementById('modalAlert');
    modalAlert.innerHTML = `<div class="alert alert-${tipo}">${mensagem}</div>`;
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
    return new Date(data).toLocaleDateString('pt-BR');
}

function formatarDataCompleta(data) {
    return new Date(data).toLocaleString('pt-BR');
}


