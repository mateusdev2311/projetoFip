// Sistema de Triagem Inteligente - JavaScript Avançado
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('triagemForm');
    const priorityDisplay = document.getElementById('priorityDisplay');
    const painSlider = document.getElementById('intensidadeDor');
    const painValue = document.getElementById('painValue');
    
    // Event listener para submissão do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        analisarPrioridade();
    });
    
    // Atualizar valor do slider de dor
    painSlider.addEventListener('input', function() {
        painValue.textContent = this.value;
        updatePainSliderColor(this.value);
    });
    
    // Atualizar cor do slider baseado no valor
    function updatePainSliderColor(value) {
        const colors = [
            '#4caf50', '#81c784', '#aed581', '#cddc39', '#ffeb3b',
            '#ffc107', '#ff9800', '#ff7043', '#f44336', '#d32f2f', '#b71c1c'
        ];
        painValue.style.backgroundColor = colors[parseInt(value)] || '#1976d2';
    }
    
    // Validação de checkboxes mutuamente exclusivos
    const doencasCheckboxes = document.querySelectorAll('input[name="doencas"]');
    const nenhumaDoenca = document.querySelector('input[name="doencas"][value="nenhuma"]');
    
    doencasCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this === nenhumaDoenca && this.checked) {
                // Se "Nenhuma conhecida" for selecionada, desmarcar todas as outras
                doencasCheckboxes.forEach(cb => {
                    if (cb !== nenhumaDoenca) cb.checked = false;
                });
            } else if (this !== nenhumaDoenca && this.checked) {
                // Se qualquer outra doença for selecionada, desmarcar "Nenhuma conhecida"
                nenhumaDoenca.checked = false;
            }
        });
    });
    
    // Função principal de análise de prioridade
    function analisarPrioridade() {
        const button = form.querySelector('.btn-primary');
        
        // Estado de loading
        button.classList.add('loading');
        button.disabled = true;
        
        // Coleta dos dados do formulário
        const dadosPaciente = coletarDadosFormulario();
        
        // Validação adicional
        if (!validarFormularioCompleto(dadosPaciente)) {
            button.classList.remove('loading');
            button.disabled = false;
            return;
        }
        
        // Simula tempo de processamento (2 segundos para análise mais complexa)
        setTimeout(() => {
            const resultado = calcularPrioridadeAvancada(dadosPaciente);
            exibirResultadoCompleto(resultado, dadosPaciente);
            
            // Remove estado de loading
            button.classList.remove('loading');
            button.disabled = false;
            
            // Scroll suave para o resultado
            document.getElementById('resultSection').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 2000);
    }
    
    // Coleta dados completos do formulário
    function coletarDadosFormulario() {
        return {
            // Dados pessoais
            nome: document.getElementById('nomeCompleto').value,
            idade: parseInt(document.getElementById('idade').value),
            genero: document.getElementById('genero').value,
            peso: parseFloat(document.getElementById('peso').value) || null,
            altura: parseInt(document.getElementById('altura').value) || null,
            
            // Sinais vitais
            frequenciaCardiaca: parseInt(document.getElementById('frequenciaCardiaca').value),
            frequenciaRespiratoria: parseInt(document.getElementById('frequenciaRespiratoria').value),
            temperatura: parseFloat(document.getElementById('temperatura').value),
            pressaoSistolica: parseInt(document.getElementById('pressaoSistolica').value),
            pressaoDiastolica: parseInt(document.getElementById('pressaoDiastolica').value),
            saturacaoOxigenio: parseInt(document.getElementById('saturacaoOxigenio').value),
            
            // Nível de consciência
            nivelConsciencia: document.getElementById('nivelConsciencia').value,
            orientacao: document.getElementById('orientacao').value,
            
            // Avaliação da dor
            intensidadeDor: parseInt(document.getElementById('intensidadeDor').value),
            localizacaoDor: document.getElementById('localizacaoDor').value,
            caracteristicaDor: document.getElementById('caracteristicaDor').value,
            
            // Queixa principal e sintomas
            queixaPrincipal: document.getElementById('queixaPrincipal').value,
            tempoSintomas: document.getElementById('tempoSintomas').value,
            sintomas: Array.from(document.querySelectorAll('input[name="sintomas"]:checked')).map(cb => cb.value),
            
            // Histórico médico
            doencas: Array.from(document.querySelectorAll('input[name="doencas"]:checked')).map(cb => cb.value),
            medicamentosUso: document.getElementById('medicamentosUso').value,
            alergias: document.getElementById('alergias').value,
            
            // Informações adicionais
            gestante: document.getElementById('gestante').value,
            cirurgiaRecente: document.getElementById('cirurgiaRecente').value,
            observacoes: document.getElementById('observacoes').value
        };
    }
    
    // Validação completa do formulário
    function validarFormularioCompleto(dados) {
        const camposObrigatorios = [
            'nome', 'idade', 'genero', 'frequenciaCardiaca', 'frequenciaRespiratoria',
            'temperatura', 'pressaoSistolica', 'pressaoDiastolica', 'saturacaoOxigenio',
            'nivelConsciencia', 'queixaPrincipal', 'tempoSintomas'
        ];
        
        for (let campo of camposObrigatorios) {
            if (!dados[campo] || dados[campo] === '') {
                alert(`Por favor, preencha o campo obrigatório: ${campo.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }
        
        // Validações específicas
        if (dados.peso && dados.altura) {
            const imc = dados.peso / Math.pow(dados.altura / 100, 2);
            if (imc < 10 || imc > 70) {
                alert('Verifique os valores de peso e altura inseridos.');
                return false;
            }
        }
        
        return true;
    }
    
    // Função para validar sinais vitais baseados em faixas etárias
    function validarSinaisVitaisPorIdade(dados) {
        const idade = dados.idade;
        const genero = dados.genero;
        let validacoes = [];

        // Frequência Cardíaca por faixa etária
        if (idade < 1) { // Recém-nascido
            if (dados.frequenciaCardiaca < 100 || dados.frequenciaCardiaca > 190) {
                validacoes.push('Frequência cardíaca fora do normal para recém-nascido (100-190 bpm)');
            }
        } else if (idade < 2) { // Lactente
            if (dados.frequenciaCardiaca < 80 || dados.frequenciaCardiaca > 150) {
                validacoes.push('Frequência cardíaca fora do normal para lactente (80-150 bpm)');
            }
        } else if (idade < 5) { // Pré-escolar
            if (dados.frequenciaCardiaca < 70 || dados.frequenciaCardiaca > 140) {
                validacoes.push('Frequência cardíaca fora do normal para pré-escolar (70-140 bpm)');
            }
        } else if (idade < 12) { // Escolar
            if (dados.frequenciaCardiaca < 60 || dados.frequenciaCardiaca > 120) {
                validacoes.push('Frequência cardíaca fora do normal para escolar (60-120 bpm)');
            }
        } else if (idade < 18) { // Adolescente
            if (dados.frequenciaCardiaca < 50 || dados.frequenciaCardiaca > 100) {
                validacoes.push('Frequência cardíaca fora do normal para adolescente (50-100 bpm)');
            }
        } else { // Adulto
            if (dados.frequenciaCardiaca < 60 || dados.frequenciaCardiaca > 100) {
                validacoes.push('Frequência cardíaca fora do normal para adulto (60-100 bpm)');
            }
        }

        // Frequência Respiratória por faixa etária
        if (idade < 1) { // Recém-nascido
            if (dados.frequenciaRespiratoria < 30 || dados.frequenciaRespiratoria > 60) {
                validacoes.push('Frequência respiratória fora do normal para recém-nascido (30-60 rpm)');
            }
        } else if (idade < 2) { // Lactente
            if (dados.frequenciaRespiratoria < 24 || dados.frequenciaRespiratoria > 40) {
                validacoes.push('Frequência respiratória fora do normal para lactente (24-40 rpm)');
            }
        } else if (idade < 5) { // Pré-escolar
            if (dados.frequenciaRespiratoria < 22 || dados.frequenciaRespiratoria > 34) {
                validacoes.push('Frequência respiratória fora do normal para pré-escolar (22-34 rpm)');
            }
        } else if (idade < 12) { // Escolar
            if (dados.frequenciaRespiratoria < 18 || dados.frequenciaRespiratoria > 30) {
                validacoes.push('Frequência respiratória fora do normal para escolar (18-30 rpm)');
            }
        } else if (idade < 18) { // Adolescente
            if (dados.frequenciaRespiratoria < 12 || dados.frequenciaRespiratoria > 20) {
                validacoes.push('Frequência respiratória fora do normal para adolescente (12-20 rpm)');
            }
        } else { // Adulto
            if (dados.frequenciaRespiratoria < 12 || dados.frequenciaRespiratoria > 20) {
                validacoes.push('Frequência respiratória fora do normal para adulto (12-20 rpm)');
            }
        }

        // Pressão Arterial por faixa etária e gênero
        const pressaoPulso = dados.pressaoSistolica - dados.pressaoDiastolica;
        if (pressaoPulso < 30 || pressaoPulso > 50) {
            validacoes.push(`Pressão de pulso anormal (${pressaoPulso} mmHg). Normal: 30-50 mmHg`);
        }

        if (idade < 1) { // Recém-nascido
            if (dados.pressaoSistolica < 60 || dados.pressaoSistolica > 90) {
                validacoes.push('Pressão sistólica fora do normal para recém-nascido (60-90 mmHg)');
            }
        } else if (idade < 2) { // Lactente
            if (dados.pressaoSistolica < 70 || dados.pressaoSistolica > 100) {
                validacoes.push('Pressão sistólica fora do normal para lactente (70-100 mmHg)');
            }
        } else if (idade < 5) { // Pré-escolar
            if (dados.pressaoSistolica < 80 || dados.pressaoSistolica > 110) {
                validacoes.push('Pressão sistólica fora do normal para pré-escolar (80-110 mmHg)');
            }
        } else if (idade < 12) { // Escolar
            if (dados.pressaoSistolica < 90 || dados.pressaoSistolica > 120) {
                validacoes.push('Pressão sistólica fora do normal para escolar (90-120 mmHg)');
            }
        } else if (idade < 18) { // Adolescente
            if (dados.pressaoSistolica < 100 || dados.pressaoSistolica > 130) {
                validacoes.push('Pressão sistólica fora do normal para adolescente (100-130 mmHg)');
            }
        } else { // Adulto
            if (genero === 'feminino') {
                if (dados.pressaoSistolica < 90 || dados.pressaoSistolica > 120) {
                    validacoes.push('Pressão sistólica fora do normal para mulher adulta (90-120 mmHg)');
                }
            } else {
                if (dados.pressaoSistolica < 100 || dados.pressaoSistolica > 130) {
                    validacoes.push('Pressão sistólica fora do normal para homem adulto (100-130 mmHg)');
                }
            }
        }

        return validacoes;
    }

    // Função para verificar medicamentos que alteram sinais vitais
    function verificarMedicamentosAlteradores(dados) {
        const medicamentosAlteradores = {
            'betabloqueador': {
                efeitos: ['Reduz frequência cardíaca', 'Reduz pressão arterial'],
                sinais: ['frequenciaCardiaca', 'pressaoSistolica', 'pressaoDiastolica']
            },
            'calcio-antagonista': {
                efeitos: ['Reduz pressão arterial', 'Pode alterar frequência cardíaca'],
                sinais: ['pressaoSistolica', 'pressaoDiastolica', 'frequenciaCardiaca']
            },
            'diuretico': {
                efeitos: ['Reduz pressão arterial', 'Pode alterar eletrólitos'],
                sinais: ['pressaoSistolica', 'pressaoDiastolica']
            },
            'vasodilatador': {
                efeitos: ['Reduz pressão arterial', 'Aumenta frequência cardíaca'],
                sinais: ['pressaoSistolica', 'pressaoDiastolica', 'frequenciaCardiaca']
            }
        };

        let alertas = [];
        if (dados.medicamentosUso) {
            const medicamentos = dados.medicamentosUso.toLowerCase();
            for (const [medicamento, info] of Object.entries(medicamentosAlteradores)) {
                if (medicamentos.includes(medicamento)) {
                    alertas.push({
                        medicamento,
                        efeitos: info.efeitos,
                        sinais: info.sinais
                    });
                }
            }
        }
        return alertas;
    }
    
    // Algoritmo avançado de classificação baseado no Protocolo de Manchester
    function calcularPrioridadeAvancada(dados) {
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
        } else if (dados.frequenciaRespiratoria < 14 || dados.frequenciaRespiratoria > 24) {
            pontuacao += 30;
            fatoresRisco.push('Frequência respiratória levemente alterada');
        }
        
        // Análise da Frequência Cardíaca
        if (dados.frequenciaCardiaca > 150 || dados.frequenciaCardiaca < 40) {
            pontuacao += 90;
            fatoresCriticos.push('Frequência cardíaca crítica');
        } else if (dados.frequenciaCardiaca > 120 || dados.frequenciaCardiaca < 50) {
            pontuacao += 60;
            fatoresRisco.push('Frequência cardíaca alterada');
        } else if (dados.frequenciaCardiaca > 100 || dados.frequenciaCardiaca < 60) {
            pontuacao += 30;
            fatoresRisco.push('Frequência cardíaca levemente alterada');
        }
        
        // Análise da Pressão Arterial
        if (dados.pressaoSistolica > 220 || dados.pressaoSistolica < 70) {
            pontuacao += 80;
            fatoresCriticos.push('Pressão arterial crítica');
        } else if (dados.pressaoSistolica > 200 || dados.pressaoSistolica < 80) {
            pontuacao += 60;
            fatoresRisco.push('Pressão arterial muito alterada');
        } else if (dados.pressaoSistolica > 180 || dados.pressaoSistolica < 90) {
            pontuacao += 40;
            fatoresRisco.push('Hipertensão arterial');
        }
        
        if (dados.pressaoDiastolica > 130 || dados.pressaoDiastolica < 40) {
            pontuacao += 70;
            fatoresCriticos.push('Pressão diastólica crítica');
        } else if (dados.pressaoDiastolica > 110 || dados.pressaoDiastolica < 50) {
            pontuacao += 50;
            fatoresRisco.push('Pressão diastólica alterada');
        }
        
        // Análise da Temperatura
        if (dados.temperatura > 41 || dados.temperatura < 34.5) {
            pontuacao += 80;
            fatoresCriticos.push('Temperatura corporal crítica');
        } else if (dados.temperatura > 39.5 || dados.temperatura < 35) {
            pontuacao += 50;
            fatoresRisco.push('Febre alta ou hipotermia');
        } else if (dados.temperatura > 38.5 || dados.temperatura < 35.5) {
            pontuacao += 25;
            fatoresRisco.push('Febre moderada');
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
        } else if (dados.intensidadeDor >= 3) {
            pontuacao += 15;
            fatoresRisco.push('Dor leve');
        }
        
        // Análise de dor específica por localização
        if (dados.localizacaoDor && dados.intensidadeDor >= 5) {
            const dorCritica = ['peito', 'torax', 'coração', 'abdomen', 'cabeça', 'crânio'];
            if (dorCritica.some(local => dados.localizacaoDor.toLowerCase().includes(local))) {
                pontuacao += 40;
                fatoresRisco.push(`Dor ${dados.caracteristicaDor || 'intensa'} em ${dados.localizacaoDor}`);
            }
        }
        
        // Análise do Tempo de Sintomas
        switch (dados.tempoSintomas) {
            case 'menos-1h':
                if (dados.sintomas.includes('convulsao') || dados.sintomas.includes('sangramento')) {
                    pontuacao += 80;
                    fatoresCriticos.push('Sintomas críticos de início agudo');
                } else {
                    pontuacao += 30;
                    fatoresRisco.push('Sintomas de início agudo');
                }
                break;
            case '1-6h':
                pontuacao += 20;
                fatoresRisco.push('Sintomas recentes');
                break;
        }
        
        // Análise de Sintomas Associados Críticos
        const sintomasCriticos = ['convulsao', 'sangramento', 'falta-ar'];
        const sintomasGraves = ['palpitacao', 'sudorese', 'nausea'];
        
        dados.sintomas.forEach(sintoma => {
            if (sintomasCriticos.includes(sintoma)) {
                pontuacao += 60;
                fatoresCriticos.push(`Sintoma crítico: ${sintoma.replace('-', ' ')}`);
            } else if (sintomasGraves.includes(sintoma)) {
                pontuacao += 30;
                fatoresRisco.push(`Sintoma grave: ${sintoma.replace('-', ' ')}`);
            } else {
                pontuacao += 10;
                fatoresRisco.push(`Sintoma: ${sintoma.replace('-', ' ')}`);
            }
        });
        
        // Análise de Doenças Preexistentes
        const doencasCriticas = ['cardiaca', 'diabetes', 'renal', 'respiratoria'];
        const doencasRisco = ['hipertensao', 'epilepsia'];
        
        dados.doencas.forEach(doenca => {
            if (doenca !== 'nenhuma') {
                if (doencasCriticas.includes(doenca)) {
                    pontuacao += 25;
                    fatoresRisco.push(`Doença preexistente: ${doenca}`);
                } else if (doencasRisco.includes(doenca)) {
                    pontuacao += 15;
                    fatoresRisco.push(`Doença preexistente: ${doenca}`);
                } else if (doenca === 'cancer') {
                    pontuacao += 35;
                    fatoresRisco.push('Histórico de câncer');
                }
            }
        });
        
        // Fatores de Idade
        if (dados.idade > 80) {
            pontuacao += 25;
            fatoresRisco.push('Idade muito avançada');
        } else if (dados.idade > 65) {
            pontuacao += 15;
            fatoresRisco.push('Idade avançada');
        } else if (dados.idade < 1) {
            pontuacao += 30;
            fatoresCriticos.push('Recém-nascido');
        } else if (dados.idade < 5) {
            pontuacao += 20;
            fatoresRisco.push('Idade pediátrica crítica');
        } else if (dados.idade < 12) {
            pontuacao += 10;
            fatoresRisco.push('Paciente pediátrico');
        }
        
        // Fatores Especiais
        if (dados.gestante === 'sim') {
            pontuacao += 20;
            fatoresRisco.push('Gestante');
        }
        
        if (dados.cirurgiaRecente === 'sim') {
            pontuacao += 30;
            fatoresRisco.push('Cirurgia recente (últimos 30 dias)');
        }
        
        // Cálculo de IMC se disponível
        let imc = null;
        if (dados.peso && dados.altura) {
            imc = dados.peso / Math.pow(dados.altura / 100, 2);
            if (imc < 16 || imc > 40) {
                pontuacao += 20;
                fatoresRisco.push(`IMC crítico: ${imc.toFixed(1)}`);
            } else if (imc < 18.5 || imc > 35) {
                pontuacao += 10;
                fatoresRisco.push(`IMC alterado: ${imc.toFixed(1)}`);
            }
        }
        
        // Adicionar validações específicas por idade
        const validacoesIdade = validarSinaisVitaisPorIdade(dados);
        validacoesIdade.forEach(validacao => {
            fatoresRisco.push(validacao);
            pontuacao += 15;
        });

        // Verificar medicamentos que alteram sinais vitais
        const medicamentosAlteradores = verificarMedicamentosAlteradores(dados);
        medicamentosAlteradores.forEach(alerta => {
            fatoresRisco.push(`Paciente em uso de ${alerta.medicamento}: ${alerta.efeitos.join(', ')}`);
            pontuacao += 10;
        });
        
        // Determinação da prioridade final
        let prioridade, cor, tempo, icone, recomendacao;
        
        if (pontuacao >= 120 || fatoresCriticos.length > 0) {
            prioridade = 'EMERGÊNCIA';
            cor = 'red';
            tempo = 'Atendimento IMEDIATO';
            icone = '🚨';
            recomendacao = 'CRÍTICO: Paciente necessita de atendimento médico imediato. Sinais vitais indicam risco de vida iminente.';
        } else if (pontuacao >= 80) {
            prioridade = 'MUITO URGENTE';
            cor = 'orange';
            tempo = 'Até 10 minutos';
            icone = '⚠️';
            recomendacao = 'GRAVE: Paciente em estado grave. Priorizar atendimento médico especializado imediatamente.';
        } else if (pontuacao >= 50) {
            prioridade = 'URGENTE';
            cor = 'yellow';
            tempo = 'Até 60 minutos';
            icone = '⚡';
            recomendacao = 'MODERADO: Paciente necessita de avaliação médica, mas pode aguardar com monitoramento constante.';
        } else if (pontuacao >= 25) {
            prioridade = 'POUCO URGENTE';
            cor = 'green';
            tempo = 'Até 120 minutos';
            icone = '🟢';
            recomendacao = 'ESTÁVEL: Paciente relativamente estável. Pode aguardar atendimento ou ser encaminhado para outros serviços.';
        } else {
            prioridade = 'NÃO URGENTE';
            cor = 'blue';
            tempo = 'Até 240 minutos';
            icone = '🔵';
            recomendacao = 'ROTINA: Sinais vitais dentro da normalidade. Atendimento de rotina sem urgência.';
        }
        
        return {
            prioridade,
            cor,
            tempo,
            icone,
            recomendacao,
            pontuacao,
            fatoresRisco: fatoresRisco.filter(f => f && f.trim() !== ''),
            fatoresCriticos: fatoresCriticos.filter(f => f && f.trim() !== ''),
            imc
        };
    }
    
    // Exibe o resultado completo da análise
    function exibirResultadoCompleto(resultado, dados) {
        const priorityIcon = priorityDisplay.querySelector('.priority-icon');
        const priorityText = priorityDisplay.querySelector('.priority-text');
        const prioritySubtitle = priorityDisplay.querySelector('.priority-subtitle');
        
        // Remove classes de prioridade anteriores
        priorityDisplay.className = priorityDisplay.className.replace(/priority-\w+/g, '');
        
        // Adiciona nova classe de prioridade
        priorityDisplay.classList.add(`priority-${resultado.cor}`);
        
        // Atualiza o conteúdo
        priorityIcon.textContent = resultado.icone;
        priorityText.textContent = resultado.prioridade;
        prioritySubtitle.innerHTML = `
            <strong>${resultado.tempo}</strong><br>
            ${resultado.recomendacao}
        `;
        
        // Remove detalhes existentes
        const detalhesExistentes = priorityDisplay.querySelector('.resultado-detalhes');
        if (detalhesExistentes) {
            detalhesExistentes.remove();
        }
        
        // Cria novos detalhes
        const detalhesDiv = document.createElement('div');
        detalhesDiv.className = 'resultado-detalhes';
        detalhesDiv.innerHTML = `
            <div class="paciente-info">
                <h4>📊 Informações do Paciente</h4>
                <p><strong>Nome:</strong> ${dados.nome}</p>
                <p><strong>Idade:</strong> ${dados.idade} anos (${dados.genero})</p>
                <p><strong>Pontuação de Risco:</strong> ${resultado.pontuacao}</p>
                ${resultado.imc ? `<p><strong>IMC:</strong> ${resultado.imc.toFixed(1)} kg/m²</p>` : ''}
                <p><strong>Queixa Principal:</strong> ${dados.queixaPrincipal}</p>
                <p><strong>Tempo dos Sintomas:</strong> ${dados.tempoSintomas.replace('-', ' ')}</p>
            </div>
            
            ${resultado.fatoresCriticos.length > 0 ? `
            <div class="fatores-criticos">
                <h4>🚨 Fatores Críticos Identificados</h4>
                <ul>${resultado.fatoresCriticos.map(fator => `<li style="color: #d32f2f; font-weight: 600;">${fator}</li>`).join('')}</ul>
            </div>
            ` : ''}
            
            <div class="fatores-risco">
                <h4>⚠️ Fatores de Risco Identificados</h4>
                ${resultado.fatoresRisco.length > 0 ? 
                    '<ul>' + resultado.fatoresRisco.map(fator => `<li>${fator}</li>`).join('') + '</ul>' :
                    '<p>Nenhum fator de risco adicional identificado.</p>'
                }
            </div>
            
            <div class="sinais-vitais">
                <h4>💓 Sinais Vitais Completos</h4>
                <div class="vitais-grid">
                    <div class="vital-item">
                        <span class="vital-label">FC:</span>
                        <span class="vital-value">${dados.frequenciaCardiaca} bpm</span>
                    </div>
                    <div class="vital-item">
                        <span class="vital-label">FR:</span>
                        <span class="vital-value">${dados.frequenciaRespiratoria} rpm</span>
                    </div>
                    <div class="vital-item">
                        <span class="vital-label">PA:</span>
                        <span class="vital-value">${dados.pressaoSistolica}/${dados.pressaoDiastolica} mmHg</span>
                    </div>
                    <div class="vital-item">
                        <span class="vital-label">Temp:</span>
                        <span class="vital-value">${dados.temperatura}°C</span>
                    </div>
                    <div class="vital-item">
                        <span class="vital-label">SpO2:</span>
                        <span class="vital-value">${dados.saturacaoOxigenio}%</span>
                    </div>
                    <div class="vital-item">
                        <span class="vital-label">Dor:</span>
                        <span class="vital-value">${dados.intensidadeDor}/10</span>
                    </div>
                    <div class="vital-item">
                        <span class="vital-label">Consciência:</span>
                        <span class="vital-value">${dados.nivelConsciencia.replace('-', ' ')}</span>
                    </div>
                    ${dados.localizacaoDor ? `
                    <div class="vital-item">
                        <span class="vital-label">Local Dor:</span>
                        <span class="vital-value">${dados.localizacaoDor}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            ${dados.sintomas.length > 0 ? `
            <div class="sintomas-associados">
                <h4>🩺 Sintomas Associados</h4>
                <div class="sintomas-list">
                    ${dados.sintomas.map(sintoma => `<span class="sintoma-tag">${sintoma.replace('-', ' ')}</span>`).join('')}
                </div>
            </div>
            ` : ''}
            
            ${dados.doencas.length > 0 && !dados.doencas.includes('nenhuma') ? `
            <div class="historico-medico">
                <h4>📋 Histórico Médico</h4>
                <div class="doencas-list">
                    ${dados.doencas.map(doenca => `<span class="doenca-tag">${doenca}</span>`).join('')}
                </div>
                ${dados.medicamentosUso ? `<p><strong>Medicamentos:</strong> ${dados.medicamentosUso}</p>` : ''}
                ${dados.alergias ? `<p><strong>Alergias:</strong> ${dados.alergias}</p>` : ''}
            </div>
            ` : ''}
        `;
        
        priorityDisplay.appendChild(detalhesDiv);
        
        // Adiciona estilos CSS para os novos elementos
        adicionarEstilosAvancados();
        
        // Efeito de animação
        priorityDisplay.style.transform = 'scale(0.95)';
        priorityDisplay.style.opacity = '0.7';
        
        setTimeout(() => {
            priorityDisplay.style.transform = 'scale(1)';
            priorityDisplay.style.opacity = '1';
            priorityDisplay.style.transition = 'all 0.3s ease';
        }, 100);
    }
    
    // Adiciona estilos CSS dinamicamente para os elementos avançados
    function adicionarEstilosAvancados() {
        if (document.getElementById('estilos-avancados')) return;
        
        const style = document.createElement('style');
        style.id = 'estilos-avancados';
        style.textContent = `
            .resultado-detalhes {
                margin-top: 20px;
                text-align: left;
            }
            
            .resultado-detalhes > div {
                background: rgba(255, 255, 255, 0.7);
                padding: 15px;
                margin: 10px 0;
                border-radius: 10px;
                border-left: 4px solid currentColor;
            }
            
            .resultado-detalhes h4 {
                margin: 0 0 10px 0;
                color: inherit;
                font-size: 1rem;
            }
            
            .resultado-detalhes p, .resultado-detalhes li {
                margin: 5px 0;
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .resultado-detalhes ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            
            .vitais-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 8px;
                margin-top: 10px;
            }
            
            .vital-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 6px;
                font-size: 0.8rem;
            }
            
            .vital-label {
                font-weight: 600;
                color: #555;
            }
            
            .vital-value {
                font-weight: 700;
                color: inherit;
            }
            
            .sintomas-list, .doencas-list {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 8px;
            }
            
            .sintoma-tag, .doenca-tag {
                background: rgba(25, 118, 210, 0.1);
                color: #1976d2;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 500;
                border: 1px solid rgba(25, 118, 210, 0.3);
            }
            
            .fatores-criticos {
                background: rgba(244, 67, 54, 0.1) !important;
                border-left-color: #f44336 !important;
            }
            
            @media (max-width: 480px) {
                .vitais-grid {
                    grid-template-columns: 1fr 1fr;
                }
                
                .sintomas-list, .doencas-list {
                    flex-direction: column;
                    gap: 4px;
                }
                
                .vital-item {
                    padding: 6px 8px;
                    font-size: 0.75rem;
                }
                
                .resultado-detalhes > div {
                    padding: 12px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Validação em tempo real dos campos
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });
        
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
    
    // Função de validação de campo atualizada
    function validateField(field) {
        const value = field.value.trim();
        const min = field.getAttribute('min');
        const max = field.getAttribute('max');
        const type = field.type;
        
        // Remove mensagens de erro anteriores
        const errorMsg = field.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
        
        let isValid = true;
        let message = '';
        
        // Validações específicas
        if (type === 'number' && value !== '') {
            const numValue = parseFloat(value);
            
            if (min && numValue < parseFloat(min)) {
                isValid = false;
                message = `Valor mínimo: ${min}`;
            } else if (max && numValue > parseFloat(max)) {
                isValid = false;
                message = `Valor máximo: ${max}`;
            }
            
            // Validações específicas por campo
            if (field.id === 'frequenciaCardiaca') {
                if (numValue < 30 || numValue > 250) {
                    isValid = false;
                    message = 'Frequência cardíaca deve estar entre 30-250 bpm';
                }
            } else if (field.id === 'frequenciaRespiratoria') {
                if (numValue < 5 || numValue > 60) {
                    isValid = false;
                    message = 'Frequência respiratória deve estar entre 5-60 rpm';
                }
            } else if (field.id === 'temperatura') {
                if (numValue < 30 || numValue > 45) {
                    isValid = false;
                    message = 'Temperatura deve estar entre 30-45°C';
                }
            } else if (field.id === 'saturacaoOxigenio') {
                if (numValue < 50 || numValue > 100) {
                    isValid = false;
                    message = 'Saturação deve estar entre 50-100%';
                }
            }
        }
        
        // Exibe mensagem de erro se necessário
        if (!isValid && message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                color: #f44336;
                font-size: 0.8rem;
                margin-top: 5px;
                animation: fadeIn 0.3s ease;
            `;
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }
        
        return isValid;
    }
    
    // Máscara para campos numéricos
    const numericInputs = form.querySelectorAll('input[type="number"]');
    numericInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (!/[\d.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });
    });
    
    // Auto-formatação de nomes
    const nomeInput = document.getElementById('nomeCompleto');
    nomeInput.addEventListener('input', function() {
        this.value = this.value.replace(/\b\w/g, l => l.toUpperCase());
    });
    
    // Inicialização
    console.log('Sistema de Triagem Inteligente Avançado inicializado com sucesso!');
    console.log('Protocolo de Manchester expandido implementado para classificação de risco.');
    
    // Atualizar valor inicial do slider
    updatePainSliderColor(painSlider.value);
}); 