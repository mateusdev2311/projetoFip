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
            TriagemPagedResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Triagem' }
                    },
                    pagination: {
                        type: 'object',
                        properties: {
                            page: { type: 'integer', example: 1 },
                            limit: { type: 'integer', example: 10 },
                            total: { type: 'integer', example: 57 },
                            pages: { type: 'integer', example: 6 }
                        }
                    }
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
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Erro interno do servidor' },
                    error: { type: 'string' }
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
                                schema: { $ref: '#/components/schemas/TriagemPagedResponse' },
                                examples: {
                                    exemplo: {
                                        value: {
                                            success: true,
                                            data: [
                                                { id: 'a1b2', nome: 'Maria', idade: 42, genero: 'feminino', prioridade: 'URGENTE', pontuacao: 55 },
                                                { id: 'c3d4', nome: 'João', idade: 33, genero: 'masculino', prioridade: 'POUCO URGENTE', pontuacao: 28 }
                                            ],
                                            pagination: { page: 1, limit: 10, total: 2, pages: 1 }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    500: { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            post: {
                summary: 'Criar triagem',
                tags: ['Triagens'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/TriagemInput' },
                            examples: {
                                exemplo: {
                                    value: {
                                        nome: 'João Silva', idade: 35, genero: 'masculino',
                                        frequenciaCardiaca: 80, frequenciaRespiratoria: 16, temperatura: 36.5,
                                        pressaoSistolica: 120, pressaoDiastolica: 80, saturacaoOxigenio: 98,
                                        nivelConsciencia: 'alerta', queixaPrincipal: 'Dor de cabeça', tempoSintomas: '2 horas'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { 
                        description: 'Criado com sucesso',
                        content: {
                            'application/json': {
                                examples: {
                                    exemplo: {
                                        value: {
                                            success: true,
                                            message: 'Triagem criada com sucesso',
                                            data: {
                                                id: 'a1b2c3d4',
                                                nome: 'João Silva',
                                                prioridade: 'URGENTE',
                                                pontuacao: 58,
                                                resultado: {
                                                    prioridade: 'URGENTE',
                                                    tempo: 'Até 60 minutos',
                                                    pontuacao: 58
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Requisição inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    500: { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
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
                responses: {
                    200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Triagem' } } } },
                    404: { description: 'Não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    500: { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            put: {
                summary: 'Atualizar triagem',
                tags: ['Triagens'],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/TriagemInput' } } }
                },
                responses: {
                    200: { 
                        description: 'Atualizado',
                        content: {
                            'application/json': {
                                examples: {
                                    exemplo: {
                                        value: {
                                            success: true,
                                            message: 'Triagem atualizada com sucesso',
                                            data: {
                                                id: 'a1b2c3d4',
                                                prioridade: 'MUITO URGENTE',
                                                pontuacao: 82
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    500: { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            },
            delete: {
                summary: 'Excluir triagem',
                tags: ['Triagens'],
                parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
                responses: {
                    200: { 
                        description: 'Excluído',
                        content: {
                            'application/json': {
                                examples: {
                                    exemplo: {
                                        value: { success: true, message: 'Triagem deletada com sucesso' }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    500: { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/triagens/stats/geral': {
            get: {
                summary: 'Estatísticas gerais',
                tags: ['Triagens'],
                responses: {
                    200: { 
                        description: 'OK',
                        content: {
                            'application/json': {
                                examples: {
                                    exemplo: {
                                        value: {
                                            success: true,
                                            data: {
                                                estatisticas: {
                                                    total_triagens: 123,
                                                    emergencias: 5,
                                                    muito_urgentes: 18,
                                                    urgentes: 60,
                                                    pouco_urgentes: 30,
                                                    nao_urgentes: 10,
                                                    pontuacao_media: 48.6,
                                                    idade_media: 41.2
                                                },
                                                triagens_por_dia: [
                                                    { data: '2024-10-01', quantidade: 7 },
                                                    { data: '2024-10-02', quantidade: 4 }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    500: { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/api/triagens/{id}/historico': {
            get: {
                summary: 'Histórico de alterações por triagem',
                tags: ['Triagens'],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: {
                        description: 'OK',
                        content: {
                            'application/json': {
                                examples: {
                                    exemplo: {
                                        value: {
                                            success: true,
                                            data: [
                                                {
                                                    id: 1,
                                                    triagem_id: 'a1b2c3d4',
                                                    acao: 'CRIACAO',
                                                    dados_anteriores: null,
                                                    dados_novos: { nome: 'Maria' },
                                                    usuario: 'sistema',
                                                    data_alteracao: '2024-10-01T10:00:00Z'
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    500: { description: 'Erro interno', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        }
    }
};

const swaggerSpec = swaggerJsdoc({
    definition: swaggerDefinition,
    apis: []
});

module.exports = { swaggerSpec };


