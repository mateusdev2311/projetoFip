const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    carregarEstatisticas();
});

async function carregarEstatisticas() {
    try {
        const resp = await fetch(`${API_BASE_URL}/triagens/stats/geral`);
        const json = await resp.json();
        if (!json.success) throw new Error(json.message || 'Falha ao carregar estatísticas');

        const dados = json.data || {};
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


