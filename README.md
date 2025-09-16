# 🏥 Sistema de Triagem Inteligente

Sistema completo de triagem baseado no Protocolo de Manchester, com frontend para coleta/análise, backend com API REST, CRUD de triagens, histórico, estatísticas, documentação Swagger e painel de chamada de pacientes.

## 📋 Visão Geral

O sistema avalia pacientes utilizando múltiplos parâmetros clínicos e classifica o risco em cores/tempos do Manchester. Possui persistência em banco, filtros, paginação, histórico de alterações e um painel que ordena a fila por prioridade e data.

## ✨ Funcionalidades

- **Formulário de Triagem Completa** (web)
  - Sinais vitais: FC, FR, PA (sist/diast e pressão de pulso), Temp, SpO₂, Consciência/Orientação
  - Dor: intensidade 0-10, localização e característica
  - Queixa principal, tempo dos sintomas e sintomas associados
  - Histórico médico: doenças, medicamentos (com alertas de fármacos que alteram sinais), alergias
  - Informações adicionais: gestação, cirurgia recente, observações

- **Classificação de Risco (Manchester)**
  - 🔴 Emergência (imediato)
  - 🟠 Muito Urgente (≤ 10 min)
  - 🟡 Urgente (≤ 60 min)
  - 🟢 Pouco Urgente (≤ 120 min)
  - 🔵 Não Urgente (≤ 240 min)

- **Backend API (Node.js + Express)**
  - CRUD de triagens: criar, listar (com paginação/filtros), buscar por ID, atualizar e deletar
  - Estatísticas agregadas e série de triagens por dia
  - Histórico de alterações por triagem
  - Documentação Swagger em `/api-docs`

- **Painel de Chamada**
  - Ordenação automática por prioridade e data
  - Exibição de próximo paciente, pontuação e prioridade
  - Atualização de fila

- **Extras técnicos**
  - Validação em tempo real (frontend)
  - Regras por idade e gênero para sinais vitais
  - Cálculo de IMC e pressão de pulso
  - Fallback: cálculo local caso o backend esteja indisponível

## 🛠️ Tecnologias

- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Backend: Node.js, Express, Swagger UI
- Banco de dados: SQLite (padrão) e suporte alternativo a MongoDB

## 📦 Estrutura do Projeto

```
projetoFip/
├── index.html           # Formulário de triagem
├── gerenciar.html       # (CRUD) Gestão de registros de triagem
├── painel.html          # Painel de chamada de pacientes
├── script.js            # Lógica de avaliação + integração API
├── painel.js            # Lógica do painel de chamada (fila)
├── styles.css           # Estilos gerais
├── README.md            # Este documento
├── README_CRUD.md       # Documentação detalhada do CRUD/API
└── backend/
    ├── server.js                    # API com SQLite
    ├── server-sqlite-backup.js      # Variante SQLite
    ├── server-mongodb.js            # API com MongoDB
    ├── swagger.js                   # Definição OpenAPI/Swagger
    ├── database.js / mongodb-config.js
    ├── models/                      # Modelos (MongoDB)
    └── package.json
```

## 🚀 Como Executar

1) Instalar dependências do backend
```bash
cd backend
npm install
```

2) Iniciar servidor (SQLite padrão)
```bash
npm start
# ou
node server.js
```

3) (Opcional) Iniciar com MongoDB
```bash
npm run start:mongodb
```

4) Acessar
- Interface de triagem: `http://localhost:3000/index.html`
- Gerenciamento (CRUD): `http://localhost:3000/gerenciar.html`
- Painel de chamada: `http://localhost:3000/painel.html`
- Documentação da API (Swagger): `http://localhost:3000/api-docs`

## 🌐 API – Endpoints Principais

- `GET /api/triagens` – Lista com paginação e filtros (`page`, `limit`, `search`, `prioridade`, `data_inicio`, `data_fim`)
- `GET /api/triagens/:id` – Detalhe por ID
- `POST /api/triagens` – Cria triagem (valida campos obrigatórios e calcula prioridade/pontuação)
- `PUT /api/triagens/:id` – Atualiza triagem (recalcula prioridade/pontuação)
- `DELETE /api/triagens/:id` – Remove triagem
- `GET /api/triagens/stats/geral` – Estatísticas agregadas + série (últimos 30 dias no SQLite)
- `GET /api/triagens/:id/historico` – Histórico de alterações

Consulte a especificação completa em `http://localhost:3000/api-docs`.

## 🧠 Lógica Clínica Implementada

- Análise de nível de consciência (A/V/D/I) e orientação
- Faixas de normalidade por idade (FC, FR, PA) e pressão de pulso
- Temperatura corporal e estratificação de risco
- Saturação de oxigênio com limiares críticos
- Dor (intensidade, localização, característica)
- Sintomas associados com lista de críticos (ex.: convulsão, sangramento, falta de ar)
- Doenças preexistentes (críticas e de risco)
- Fatores especiais: idade extrema, gestação, cirurgia recente
- IMC (alertas por extremos)
- Integração de todos os fatores em pontuação e categoria Manchester

## 🔒 Validação e Qualidade

- Validação de campos obrigatórios (frontend e backend)
- Sanitização e checagem de faixas numéricas
- Histórico de alterações para auditoria (criação/atualização/remoção)

## ⚠️ Considerações

- Ferramenta de apoio à decisão: não substitui avaliação médica
- Mantenha as faixas clínicas conforme diretrizes vigentes
- Em áreas remotas, utilize o painel para priorizar rapidamente o atendimento

## 📝 Licença

Projeto sob licença MIT.

## 👥 Autores/Contribuição

Consulte `README_CRUD.md` para a lista de desenvolvedores e detalhes adicionais do CRUD/API.

## 📚 Referências (seleção)

- Manchester Triage Group. Emergency Triage (3ª ed.)
- Fleming, S., et al. (2011). The Lancet – faixas pediátricas
- Whelton, P. K., et al. (2018). Diretrizes de PA em adultos
- Teasdale & Jennett (1974). Escala de Coma de Glasgow

## 📞 Suporte

Abra uma issue no repositório do projeto.