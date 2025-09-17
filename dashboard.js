const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    carregarEstatisticas();
    inicializarSidebar();
    
    // Adicionar eventos do modal de exportação
    const modal = document.getElementById('modalExportacao');
    const btnExportar = document.getElementById('exportarExcel');
    const btnCancelar = document.getElementById('btnCancelarExport');
    const btnConfirmar = document.getElementById('btnConfirmarExport');
    const closeBtn = document.querySelector('.close');
    const periodoSelect = document.getElementById('periodoExportacao');
    
    // Abrir modal
    btnExportar.addEventListener('click', abrirModalExportacao);
    
    // Fechar modal
    btnCancelar.addEventListener('click', fecharModalExportacao);
    closeBtn.addEventListener('click', fecharModalExportacao);
    
    // Fechar modal clicando fora dele
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            fecharModalExportacao();
        }
    });
    
    // Atualizar nome do arquivo quando período muda
    periodoSelect.addEventListener('change', atualizarNomeArquivo);
    
    // Confirmar exportação
    btnConfirmar.addEventListener('click', confirmarExportacao);
    
    // Atualizar nome do arquivo inicial
    atualizarNomeArquivo();
});

async function carregarEstatisticas() {
    try {
        const resp = await fetch(`${API_BASE_URL}/triagens/stats/geral`);
        const json = await resp.json();
        if (!json.success) throw new Error(json.message || 'Falha ao carregar estatísticas');

        const dados = json.data || {};
        
        // Armazenar dados globalmente para exportação
        dadosDashboard = dados;
        
        preencherCards(dados.estatisticas || {});
        renderizarPorDia(dados.triagens_por_dia || []);
        renderizarPrioridade(dados.estatisticas || {});
        renderizarGenero(Array.isArray(dados.distribuicao_genero) ? dados.distribuicao_genero : []);
        renderizarFaixaEtaria(Array.isArray(dados.distribuicao_faixa_etaria) ? dados.distribuicao_faixa_etaria : []);
    } catch (e) {
        console.error('Erro ao carregar estatísticas:', e);
    }
}

function preencherCards(est) {
    const total = est.total_triagens || 0;
    const pont = est.pontuacao_media ? Number(est.pontuacao_media).toFixed(1) : '-';
    const idade = est.idade_media ? Number(est.idade_media).toFixed(1) : '-';
    document.getElementById('totalTriagens').textContent = total;
    document.getElementById('pontuacaoMedia').textContent = pont;
    document.getElementById('idadeMedia').textContent = idade;
}

let charts = {};

function destroyChart(key) {
    if (charts[key]) { charts[key].destroy(); delete charts[key]; }
}

function renderizarPorDia(series) {
    destroyChart('porDia');
    const labels = series.map(i => i.data).reverse();
    const values = series.map(i => i.quantidade).reverse();
    charts.porDia = new Chart(document.getElementById('chartPorDia'), {
        type: 'line',
        data: { labels, datasets: [{ label: 'Triagens', data: values, borderColor: '#1976d2', backgroundColor: 'rgba(25,118,210,0.2)', tension: 0.25, fill: true }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function renderizarPrioridade(est) {
    destroyChart('prioridade');
    const labels = ['EMERGÊNCIA', 'MUITO URGENTE', 'URGENTE', 'POUCO URGENTE', 'NÃO URGENTE'];
    const values = [est.emergencias||0, est.muito_urgentes||0, est.urgentes||0, est.pouco_urgentes||0, est.nao_urgentes||0];
    const colors = ['#ef5350','#ffa726','#ffee58','#66bb6a','#42a5f5'];
    charts.prioridade = new Chart(document.getElementById('chartPrioridade'), {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, backgroundColor: colors }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderizarGenero(items) {
    destroyChart('genero');
    const map = { masculino: 0, feminino: 0, outro: 0 };
    items.forEach(i => { map[i.genero] = i.quantidade; });
    const labels = ['Masculino','Feminino','Outro'];
    const values = [map.masculino||0, map.feminino||0, map.outro||0];
    const colors = ['#42a5f5','#ec407a','#ab47bc'];
    charts.genero = new Chart(document.getElementById('chartGenero'), {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Qtd', data: values, backgroundColor: colors }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, precision: 0 } } }
    });
}

function renderizarFaixaEtaria(items) {
    destroyChart('faixa');
    // Mapear boundaries para labels legíveis
    const faixaLabels = {
        0: '0-1', 1: '1-2', 2: '2-5', 5: '5-12', 12: '12-18', 18: '18-30', 30: '30-45', 45: '45-60', 60: '60-75', 75: '75+'
    };
    const ordered = ['0','1','2','5','12','18','30','45','60','75'];
    const map = {};
    items.forEach(i => { map[i.faixa] = i.quantidade; });
    const labels = ordered.map(k => faixaLabels[k]);
    const values = ordered.map(k => map[Number(k)] || 0);
    charts.faixa = new Chart(document.getElementById('chartFaixaEtaria'), {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Qtd', data: values, backgroundColor: '#26a69a' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, precision: 0 } } }
    });
}

// Variável global para armazenar os dados do dashboard
let dadosDashboard = {};

async function exportarParaExcel() {
    try {
        // Mostrar loading no botão
        const btn = document.getElementById('exportarExcel');
        const textoOriginal = btn.textContent;
        btn.textContent = '⏳ Gerando...';
        btn.disabled = true;

        // Recarregar dados para garantir que temos as informações mais recentes
        await carregarEstatisticas();
        
        // Buscar dados detalhados das triagens
        const resp = await fetch(`${API_BASE_URL}/triagens`);
        const json = await resp.json();
        
        if (!json.success) {
            throw new Error(json.message || 'Falha ao carregar dados das triagens');
        }

        const triagens = json.data || [];
        
        // Gerar arquivo Excel
        gerarArquivoExcel(dadosDashboard, triagens);
        
        // Restaurar botão
        btn.textContent = textoOriginal;
        btn.disabled = false;
        
    } catch (error) {
        console.error('Erro ao exportar:', error);
        alert('Erro ao exportar dados: ' + error.message);
        
        // Restaurar botão em caso de erro
        const btn = document.getElementById('exportarExcel');
        btn.textContent = '📊 Exportar Excel';
        btn.disabled = false;
    }
}

function gerarArquivoExcel(dados, triagens) {
    const workbook = XLSX.utils.book_new();
    
    // Aba 1: Estatísticas Gerais
    const estatisticas = [
        ['Métrica', 'Valor'],
        ['Total de Triagens (30 dias)', dados.estatisticas?.total_triagens || 0],
        ['Pontuação Média', dados.estatisticas?.pontuacao_media ? Number(dados.estatisticas.pontuacao_media).toFixed(1) : '-'],
        ['Idade Média', dados.estatisticas?.idade_media ? Number(dados.estatisticas.idade_media).toFixed(1) : '-'],
        ['Emergências', dados.estatisticas?.emergencias || 0],
        ['Muito Urgentes', dados.estatisticas?.muito_urgentes || 0],
        ['Urgentes', dados.estatisticas?.urgentes || 0],
        ['Pouco Urgentes', dados.estatisticas?.pouco_urgentes || 0],
        ['Não Urgentes', dados.estatisticas?.nao_urgentes || 0]
    ];
    
    const wsEstatisticas = XLSX.utils.aoa_to_sheet(estatisticas);
    XLSX.utils.book_append_sheet(workbook, wsEstatisticas, 'Estatísticas Gerais');
    
    // Aba 2: Triagens por Dia
    const triagensPorDia = [
        ['Data', 'Quantidade']
    ];
    
    if (dados.triagens_por_dia && Array.isArray(dados.triagens_por_dia)) {
        dados.triagens_por_dia.forEach(item => {
            triagensPorDia.push([item.data, item.quantidade]);
        });
    }
    
    const wsPorDia = XLSX.utils.aoa_to_sheet(triagensPorDia);
    XLSX.utils.book_append_sheet(workbook, wsPorDia, 'Triagens por Dia');
    
    // Aba 3: Distribuição por Gênero
    const distribuicaoGenero = [
        ['Gênero', 'Quantidade']
    ];
    
    if (dados.distribuicao_genero && Array.isArray(dados.distribuicao_genero)) {
        dados.distribuicao_genero.forEach(item => {
            distribuicaoGenero.push([item.genero, item.quantidade]);
        });
    }
    
    const wsGenero = XLSX.utils.aoa_to_sheet(distribuicaoGenero);
    XLSX.utils.book_append_sheet(workbook, wsGenero, 'Distribuição por Gênero');
    
    // Aba 4: Distribuição por Faixa Etária
    const distribuicaoFaixaEtaria = [
        ['Faixa Etária', 'Quantidade']
    ];
    
    if (dados.distribuicao_faixa_etaria && Array.isArray(dados.distribuicao_faixa_etaria)) {
        const faixaLabels = {
            0: '0-1', 1: '1-2', 2: '2-5', 5: '5-12', 12: '12-18', 
            18: '18-30', 30: '30-45', 45: '45-60', 60: '60-75', 75: '75+'
        };
        
        dados.distribuicao_faixa_etaria.forEach(item => {
            distribuicaoFaixaEtaria.push([faixaLabels[item.faixa] || item.faixa, item.quantidade]);
        });
    }
    
    const wsFaixaEtaria = XLSX.utils.aoa_to_sheet(distribuicaoFaixaEtaria);
    XLSX.utils.book_append_sheet(workbook, wsFaixaEtaria, 'Distribuição por Faixa Etária');
    
    // Aba 5: Dados Detalhados das Triagens
    const dadosDetalhados = [
        ['ID', 'Data', 'Nome', 'Idade', 'Gênero', 'Prioridade', 'Pontuação', 'Sintomas']
    ];
    
    triagens.forEach(triagem => {
        dadosDetalhados.push([
            triagem.id || '',
            triagem.data_criacao || '',
            triagem.nome || '',
            triagem.idade || '',
            triagem.genero || '',
            triagem.prioridade || '',
            triagem.pontuacao || '',
            triagem.sintomas || ''
        ]);
    });
    
    const wsDetalhados = XLSX.utils.aoa_to_sheet(dadosDetalhados);
    XLSX.utils.book_append_sheet(workbook, wsDetalhados, 'Dados Detalhados');
    
    // Gerar nome do arquivo com data atual
    const dataAtual = new Date().toISOString().split('T')[0];
    const nomeArquivo = `dashboard_triagens_${dataAtual}.xlsx`;
    
    // Salvar arquivo
    XLSX.writeFile(workbook, nomeArquivo);
    
    // Mostrar mensagem de sucesso
    alert(`Arquivo Excel gerado com sucesso: ${nomeArquivo}`);
}

// ========================
// Funções do Modal
// ========================

function abrirModalExportacao() {
    const modal = document.getElementById('modalExportacao');
    modal.style.display = 'block';
    
    // Adicionar animação de entrada
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function fecharModalExportacao() {
    const modal = document.getElementById('modalExportacao');
    modal.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 200);
}

function atualizarNomeArquivo() {
    const periodo = document.getElementById('periodoExportacao').value;
    const dataAtual = new Date().toISOString().split('T')[0];
    
    let sufixo = '';
    switch(periodo) {
        case '7': sufixo = '_7dias'; break;
        case '30': sufixo = '_30dias'; break;
        case '90': sufixo = '_90dias'; break;
        case 'all': sufixo = '_completo'; break;
    }
    
    const nomeArquivo = `dashboard_triagens${sufixo}_${dataAtual}.xlsx`;
    document.getElementById('nomeArquivo').textContent = nomeArquivo;
}

async function confirmarExportacao() {
    try {
        // Verificar se pelo menos uma opção está selecionada
        const opcoesSelecionadas = [
            document.getElementById('exportEstatisticas').checked,
            document.getElementById('exportPorDia').checked,
            document.getElementById('exportGenero').checked,
            document.getElementById('exportFaixaEtaria').checked,
            document.getElementById('exportDetalhados').checked
        ];
        
        if (!opcoesSelecionadas.some(opcao => opcao)) {
            alert('Por favor, selecione pelo menos uma opção para exportar.');
            return;
        }
        
        // Mostrar loading no botão
        const btn = document.getElementById('btnConfirmarExport');
        btn.classList.add('loading');
        btn.disabled = true;
        
        // Obter opções selecionadas
        const opcoes = {
            estatisticas: document.getElementById('exportEstatisticas').checked,
            porDia: document.getElementById('exportPorDia').checked,
            genero: document.getElementById('exportGenero').checked,
            faixaEtaria: document.getElementById('exportFaixaEtaria').checked,
            detalhados: document.getElementById('exportDetalhados').checked,
            periodo: document.getElementById('periodoExportacao').value
        };
        
        // Recarregar dados para garantir que temos as informações mais recentes
        await carregarEstatisticas();
        
        // Buscar dados detalhados das triagens
        const resp = await fetch(`${API_BASE_URL}/triagens`);
        const json = await resp.json();
        
        if (!json.success) {
            throw new Error(json.message || 'Falha ao carregar dados das triagens');
        }

        const triagens = json.data || [];
        
        // Gerar arquivo Excel com as opções selecionadas
        gerarArquivoExcelComOpcoes(dadosDashboard, triagens, opcoes);
        
        // Fechar modal
        fecharModalExportacao();
        
        // Restaurar botão
        btn.classList.remove('loading');
        btn.disabled = false;
        
    } catch (error) {
        console.error('Erro ao exportar:', error);
        alert('Erro ao exportar dados: ' + error.message);
        
        // Restaurar botão em caso de erro
        const btn = document.getElementById('btnConfirmarExport');
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

function gerarArquivoExcelComOpcoes(dados, triagens, opcoes) {
    const workbook = XLSX.utils.book_new();
    
    // Filtrar triagens por período se necessário
    let triagensFiltradas = triagens;
    if (opcoes.periodo !== 'all') {
        const dias = parseInt(opcoes.periodo);
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - dias);
        
        triagensFiltradas = triagens.filter(triagem => {
            const dataTriagem = new Date(triagem.data_criacao);
            return dataTriagem >= dataLimite;
        });
    }
    
    // Aba 1: Estatísticas Gerais
    if (opcoes.estatisticas) {
        const estatisticas = [
            ['Métrica', 'Valor'],
            ['Total de Triagens', dados.estatisticas?.total_triagens || 0],
            ['Pontuação Média', dados.estatisticas?.pontuacao_media ? Number(dados.estatisticas.pontuacao_media).toFixed(1) : '-'],
            ['Idade Média', dados.estatisticas?.idade_media ? Number(dados.estatisticas.idade_media).toFixed(1) : '-'],
            ['Emergências', dados.estatisticas?.emergencias || 0],
            ['Muito Urgentes', dados.estatisticas?.muito_urgentes || 0],
            ['Urgentes', dados.estatisticas?.urgentes || 0],
            ['Pouco Urgentes', dados.estatisticas?.pouco_urgentes || 0],
            ['Não Urgentes', dados.estatisticas?.nao_urgentes || 0]
        ];
        
        const wsEstatisticas = XLSX.utils.aoa_to_sheet(estatisticas);
        XLSX.utils.book_append_sheet(workbook, wsEstatisticas, 'Estatísticas Gerais');
    }
    
    // Aba 2: Triagens por Dia
    if (opcoes.porDia) {
        const triagensPorDia = [
            ['Data', 'Quantidade']
        ];
        
        if (dados.triagens_por_dia && Array.isArray(dados.triagens_por_dia)) {
            dados.triagens_por_dia.forEach(item => {
                triagensPorDia.push([item.data, item.quantidade]);
            });
        }
        
        const wsPorDia = XLSX.utils.aoa_to_sheet(triagensPorDia);
        XLSX.utils.book_append_sheet(workbook, wsPorDia, 'Triagens por Dia');
    }
    
    // Aba 3: Distribuição por Gênero
    if (opcoes.genero) {
        const distribuicaoGenero = [
            ['Gênero', 'Quantidade']
        ];
        
        if (dados.distribuicao_genero && Array.isArray(dados.distribuicao_genero)) {
            dados.distribuicao_genero.forEach(item => {
                distribuicaoGenero.push([item.genero, item.quantidade]);
            });
        }
        
        const wsGenero = XLSX.utils.aoa_to_sheet(distribuicaoGenero);
        XLSX.utils.book_append_sheet(workbook, wsGenero, 'Distribuição por Gênero');
    }
    
    // Aba 4: Distribuição por Faixa Etária
    if (opcoes.faixaEtaria) {
        const distribuicaoFaixaEtaria = [
            ['Faixa Etária', 'Quantidade']
        ];
        
        if (dados.distribuicao_faixa_etaria && Array.isArray(dados.distribuicao_faixa_etaria)) {
            const faixaLabels = {
                0: '0-1', 1: '1-2', 2: '2-5', 5: '5-12', 12: '12-18', 
                18: '18-30', 30: '30-45', 45: '45-60', 60: '60-75', 75: '75+'
            };
            
            dados.distribuicao_faixa_etaria.forEach(item => {
                distribuicaoFaixaEtaria.push([faixaLabels[item.faixa] || item.faixa, item.quantidade]);
            });
        }
        
        const wsFaixaEtaria = XLSX.utils.aoa_to_sheet(distribuicaoFaixaEtaria);
        XLSX.utils.book_append_sheet(workbook, wsFaixaEtaria, 'Distribuição por Faixa Etária');
    }
    
    // Aba 5: Dados Detalhados das Triagens
    if (opcoes.detalhados) {
        const dadosDetalhados = [
            ['ID', 'Data', 'Nome', 'Idade', 'Gênero', 'Prioridade', 'Pontuação', 'Sintomas']
        ];
        
        triagensFiltradas.forEach(triagem => {
            dadosDetalhados.push([
                triagem.id || '',
                triagem.data_criacao || '',
                triagem.nome || '',
                triagem.idade || '',
                triagem.genero || '',
                triagem.prioridade || '',
                triagem.pontuacao || '',
                triagem.sintomas || ''
            ]);
        });
        
        const wsDetalhados = XLSX.utils.aoa_to_sheet(dadosDetalhados);
        XLSX.utils.book_append_sheet(workbook, wsDetalhados, 'Dados Detalhados');
    }
    
    // Gerar nome do arquivo com base nas opções
    const dataAtual = new Date().toISOString().split('T')[0];
    let sufixo = '';
    switch(opcoes.periodo) {
        case '7': sufixo = '_7dias'; break;
        case '30': sufixo = '_30dias'; break;
        case '90': sufixo = '_90dias'; break;
        case 'all': sufixo = '_completo'; break;
    }
    
    const nomeArquivo = `dashboard_triagens${sufixo}_${dataAtual}.xlsx`;
    
    // Salvar arquivo
    XLSX.writeFile(workbook, nomeArquivo);
    
    // Mostrar mensagem de sucesso
    alert(`Arquivo Excel gerado com sucesso: ${nomeArquivo}`);
}

// ========================
// Funções do Sidebar
// ========================

function inicializarSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mainContent = document.getElementById('mainContent');
    
    // Verificar se os elementos existem
    if (!sidebar || !sidebarToggle || !sidebarOverlay || !mainContent) {
        console.warn('Elementos do sidebar não encontrados');
        return;
    }
    
    // Toggle sidebar
    sidebarToggle.addEventListener('click', () => {
        toggleSidebar();
    });
    
    // Fechar sidebar clicando no overlay
    sidebarOverlay.addEventListener('click', () => {
        fecharSidebar();
    });
    
    // Fechar sidebar com ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sidebar.classList.contains('open')) {
            fecharSidebar();
        }
    });
    
    // Verificar se deve abrir sidebar automaticamente em desktop
    // Sidebar inicia fechada em todas as telas
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mainContent = document.getElementById('mainContent');
    
    if (sidebar.classList.contains('open')) {
        fecharSidebar();
    } else {
        abrirSidebar();
    }
}

function abrirSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.add('open');
    sidebarToggle.classList.add('open');
    sidebarToggle.innerHTML = '✕';
    sidebarOverlay.classList.add('active');
    
    // Em desktop, mover o conteúdo principal
    if (window.innerWidth > 768) {
        mainContent.classList.add('sidebar-open');
    }
}

function fecharSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.remove('open');
    sidebarToggle.classList.remove('open');
    sidebarToggle.innerHTML = '☰';
    sidebarOverlay.classList.remove('active');
    mainContent.classList.remove('sidebar-open');
}


