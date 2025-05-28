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

## 📞 Suporte

Para suporte, por favor abra uma issue no repositório do projeto. 