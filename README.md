# 🏥 Sistema de Triagem Inteligente

Sistema avançado de triagem médica baseado no Protocolo de Manchester, desenvolvido para unidades de saúde em áreas remotas.

## 📋 Descrição

Este sistema implementa um protocolo de triagem inteligente que avalia pacientes de forma rápida e precisa, classificando-os em diferentes níveis de prioridade baseados em múltiplos parâmetros clínicos. O sistema é especialmente útil para unidades de saúde em áreas remotas, onde recursos médicos podem ser limitados.

## ✨ Funcionalidades Principais

- **Avaliação Completa de Sinais Vitais**
  - Frequência cardíaca
  - Frequência respiratória
  - Pressão arterial
  - Temperatura corporal
  - Saturação de oxigênio
  - Nível de consciência

- **Classificação por Idade**
  - Recém-nascido (< 1 ano)
  - Lactente (1-2 anos)
  - Pré-escolar (2-5 anos)
  - Escolar (5-12 anos)
  - Adolescente (12-18 anos)
  - Adulto (> 18 anos)

- **Avaliação da Dor**
  - Escala visual de 0-10
  - Localização específica
  - Características da dor

- **Histórico Médico**
  - Doenças preexistentes
  - Medicamentos em uso
  - Alergias conhecidas

- **Classificação de Prioridade**
  - 🔴 Vermelho: Emergência (atendimento imediato)
  - 🟠 Laranja: Muito Urgente (até 10 minutos)
  - 🟡 Amarelo: Urgente (até 60 minutos)
  - 🟢 Verde: Pouco Urgente (até 120 minutos)
  - 🔵 Azul: Não Urgente (até 240 minutos)

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Protocolo de Manchester

## 📦 Estrutura do Projeto

```
projeto/
├── index.html          # Interface do usuário
├── styles.css          # Estilos e layout
├── script.js           # Lógica de triagem
└── README.md           # Documentação
```

## 🚀 Como Usar

1. Clone o repositório
2. Abra o arquivo `index.html` em um navegador moderno
3. Preencha o formulário de triagem com os dados do paciente
4. Clique em "Analisar Prioridade Completa"
5. O sistema irá classificar o paciente e exibir recomendações

## 🎯 Características Técnicas

- Interface responsiva
- Validação em tempo real
- Análise baseada em múltiplos parâmetros
- Consideração de faixas etárias
- Detecção de medicamentos que alteram sinais vitais
- Cálculo de pressão de pulso
- Validação por gênero

## 📊 Parâmetros Clínicos

### Sinais Vitais por Idade

#### Recém-nascido (< 1 ano)
- Frequência cardíaca: 100-190 bpm
- Frequência respiratória: 30-60 rpm
- Pressão sistólica: 60-90 mmHg

#### Adulto
- Frequência cardíaca: 60-100 bpm
- Frequência respiratória: 12-20 rpm
- Pressão sistólica: 
  - Homens: 100-130 mmHg
  - Mulheres: 90-120 mmHg

## ⚠️ Considerações Importantes

- O sistema é uma ferramenta de apoio à decisão clínica
- Sempre confirme os resultados com avaliação médica
- Mantenha os dados atualizados conforme novas diretrizes
- Considere fatores locais e específicos da unidade

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👥 Contribuição

Contribuições são bem-vindas! Por favor, leia o arquivo CONTRIBUTING.md para detalhes sobre nosso código de conduta e o processo para enviar pull requests.

## 📚 Referências Bibliográficas

1. **Protocolo de Manchester**
   - Mackway-Jones, K., et al. (2014). Emergency Triage: Manchester Triage Group. 3rd Edition. Wiley-Blackwell.

2. **Sinais Vitais em Pediatria**
   - Fleming, S., et al. (2011). Normal ranges of heart rate and respiratory rate in children from birth to 18 years of age: a systematic review of observational studies. The Lancet, 377(9770), 1011-1018.

3. **Pressão Arterial por Gênero**
   - Whelton, P. K., et al. (2018). 2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults. Journal of the American College of Cardiology, 71(19), e127-e248.

4. **Escala de Dor**
   - Melzack, R. (1975). The McGill Pain Questionnaire: major properties and scoring methods. Pain, 1(3), 277-299.

5. **Medicamentos e Sinais Vitais**
   - Brunton, L. L., et al. (2018). Goodman & Gilman's: The Pharmacological Basis of Therapeutics. 13th Edition. McGraw-Hill Education.

6. **Triagem em Emergência**
   - FitzGerald, G., et al. (2010). Emergency department triage revisited. Emergency Medicine Journal, 27(2), 86-92.

7. **Saturação de Oxigênio**
   - Jubran, A. (2015). Pulse oximetry. Critical Care, 19(1), 272.

8. **Níveis de Consciência**
   - Teasdale, G., & Jennett, B. (1974). Assessment of coma and impaired consciousness. The Lancet, 304(7872), 81-84.

## 📞 Suporte

Para suporte, por favor abra uma issue no repositório do projeto. 