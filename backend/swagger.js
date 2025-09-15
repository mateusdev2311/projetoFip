const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
        title: 'API - Sistema de Triagem Inteligente',
        version: '1.0.0',
        description: 'Documentação das rotas da API de Triagens',
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Servidor local'
        }
    ],
    components: {
        schemas: {
            Triagem: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'a1b2c3d4' },
                    nome: { type: 'string' },
                    idade: { type: 'integer' },
                    genero: { type: 'string', example: 'masculino' },
                    frequenciaCardiaca: { type: 'integer' },
                    frequenciaRespiratoria: { type: 'integer' },
                    temperatura: { type: 'number' },
                    pressaoSistolica: { type: 'integer' },
                    pressaoDiastolica: { type: 'integer' },
                    saturacaoOxigenio: { type: 'integer' },
                    nivelConsciencia: { type: 'string' },
                    queixaPrincipal: { type: 'string' },
                    tempoSintomas: { type: 'string' },
                    prioridade: { type: 'string' },
                    pontuacao: { type: 'number' },
                    dataTriagem: { type: 'string', format: 'date-time' },
                    dataAtualizacao: { type: 'string', format: 'date-time' }
                }
            },
            TriagemInput: {
                type: 'object',
                required: [
                    'nome','idade','genero','frequenciaCardiaca','frequenciaRespiratoria','temperatura','pressaoSistolica','pressaoDiastolica','saturacaoOxigenio','nivelConsciencia','queixaPrincipal','tempoSintomas'
                ],
                properties: {
                    nome: { type: 'string' },
                    idade: { type: 'integer' },
                    genero: { type: 'string' },
                    frequenciaCardiaca: { type: 'integer' },
                    frequenciaRespiratoria: { type: 'integer' },
                    temperatura: { type: 'number' },
                    pressaoSistolica: { type: 'integer' },
                    pressaoDiastolica: { type: 'integer' },
                    saturacaoOxigenio: { type: 'integer' },
                    nivelConsciencia: { type: 'string' },
                    queixaPrincipal: { type: 'string' },
                    tempoSintomas: { type: 'string' }
                }
            }
        }
    },
    paths: {
        '/api/triagens': {
            get: {
                summary: 'Listar triagens',
                tags: ['Triagens'],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'prioridade', in: 'query', schema: { type: 'string' } },
                    { name: 'data_inicio', in: 'query', schema: { type: 'string', format: 'date' } },
                    { name: 'data_fim', in: 'query', schema: { type: 'string', format: 'date' } }
                ],
                responses: {
                    200: {
                        description: 'Lista de triagens',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Triagem' } },
                                        pagination: { type: 'object' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Criar triagem',
                tags: ['Triagens'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/TriagemInput' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Criado com sucesso' },
                    400: { description: 'Requisição inválida' }
                }
            }
        },
        '/api/triagens/{id}': {
            get: {
                summary: 'Buscar triagem por ID',
                tags: ['Triagens'],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: { 200: { description: 'OK' }, 404: { description: 'Não encontrado' } }
            },
            put: {
                summary: 'Atualizar triagem',
                tags: ['Triagens'],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/TriagemInput' } } }
                },
                responses: { 200: { description: 'Atualizado' }, 404: { description: 'Não encontrado' } }
            },
            delete: {
                summary: 'Excluir triagem',
                tags: ['Triagens'],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: { 200: { description: 'Excluído' }, 404: { description: 'Não encontrado' } }
            }
        },
        '/api/triagens/stats/geral': {
            get: {
                summary: 'Estatísticas gerais',
                tags: ['Triagens'],
                responses: { 200: { description: 'OK' } }
            }
        }
    }
};

const swaggerSpec = swaggerJsdoc({
    definition: swaggerDefinition,
    apis: []
});

module.exports = { swaggerSpec };


