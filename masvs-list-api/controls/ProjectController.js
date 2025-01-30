'use strict';

const { where } = require('sequelize');
var models = require('../models');
var request = models.request;
const uuid = require('uuid');
class ProjectController {
    async getProjects(req, res) {
        const entity_external_id = req.params.entity_external_id;
        if (!entity_external_id) {
            res.status(404);
            res.json({ msg: 'Se requiere una entidad', code: 404 });
        }

        try {
            const entity = await models.entity.findOne({ where: { external_id: entity_external_id }, attributes: ['id'] });

            const projects = await models.project.findAll({
                where: { entity_id: entity.id },
                attributes: ['external_id', 'name', 'description', 'createdAt', 'state', 'id'],
            });

            if (!projects) {
                res.status(404);
                res.json({ msg: 'No se encontraron proyectos', code: 404 });
            }
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: projects });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Algo salio mal en listar requestes', code: 500, info: error });
        }
    }


    async getProject(req, res) {
        const entity_external_id = req.params.entity_external_id;
        const project_external_id = req.params.project_external_id;

        if (!entity_external_id) {
            return res.status(404).json({ msg: 'Se requiere una entidad', code: 404 });
        }

        try {
            // Buscar la entidad por external_id
            const entity = await models.entity.findOne({
                where: { external_id: entity_external_id },
                attributes: ['id']
            });

            if (!entity) {
                return res.status(404).json({ msg: 'Entidad no encontrada', code: 404 });
            }

            // Buscar el proyecto
            const project = await models.project.findOne({
                where: { entity_id: entity.id, external_id: project_external_id },
                attributes: ['external_id', 'name', 'description', 'createdAt', 'state', 'id']
            });

            if (!project) {
                return res.status(404).json({ msg: 'Proyecto no encontrado', code: 404 });
            }

            // Buscar las relaciones project_question
            const projectQuestions = await models.project_question.findAll({
                where: { project_id: project.id },
                attributes: ['state', 'question_id', "id"],
            });

            // Obtener los question_id de las relaciones
            const questionIds = projectQuestions.map(pq => pq.question_id);

            // Buscar las preguntas junto con sus tipos
            const questions = await models.question.findAll({
                where: { id: questionIds }
            });
            const typeQuestionsIds = questions.map(q => q.type_question_id);
            const typeQuestions = await models.type_question.findAll({
                where: { id: typeQuestionsIds },
                attributes: ['name']
            });

            return res.status(200).json({
                msg: 'OK!',
                code: 200,
                info: { project, projectQuestions, typeQuestions }
            });

        } catch (error) {
            return res.status(500).json({ msg: 'Algo salió mal al obtener el proyecto', code: 500, info: error });
        }
    }

    async getAloneProject(req, res) {
        const entity_external_id = req.params.entity_external_id;
        const project_external_id = req.params.project_external_id;

        if (!entity_external_id) {
            return res.status(404).json({ msg: 'Se requiere una entidad', code: 404 });
        }

        try {
            // Buscar la entidad por external_id
            const entity = await models.entity.findOne({
                where: { external_id: entity_external_id },
                attributes: ['id']
            });

            if (!entity) {
                return res.status(404).json({ msg: 'Entidad no encontrada', code: 404 });
            }

            // Buscar el proyecto
            const project = await models.project.findOne({
                where: { entity_id: entity.id, external_id: project_external_id },
                attributes: ['external_id', 'name', 'description', 'createdAt', 'state', 'id']
            });
            const projectQuestions = await models.project_question.findAll({
                where: { project_id: project.id },
                attributes: ['state', 'question_id', "id"],
            });

            // Obtener los question_id de las relaciones
            const questionIds = projectQuestions.map(pq => pq.question_id);

            // Buscar las preguntas junto con sus tipos
            const questions = await models.question.findAll({
                where: { id: questionIds }
            });
            const typeQuestionsIds = questions.map(q => q.type_question_id);
            const typeQuestions = await models.type_question.findAll({
                where: { id: typeQuestionsIds },
                attributes: ['name']
            });

            if (!project) {
                return res.status(404).json({ msg: 'Proyecto no encontrado', code: 404 });
            }

            return res.status(200).json({
                msg: 'OK!',
                code: 200,
                info:  {project, typeQuestions }
            });

        } catch (error) {
            return res.status(500).json({ msg: 'Algo salió mal al obtener el proyecto', code: 500, info: error });
        }
    }


    async addProject(req, res) {
        let transaction = await models.sequelize.transaction();
        const entity_external_id = req.params.entity_external_id;

        if (!entity_external_id) {
            return res.status(404).json({ msg: 'Se requiere una entidad', code: 404 });
        }
        if (!req.body.projectTitle || !req.body.projectDescription) {
            return res.status(400).json({ msg: 'Se requiere nombre y descripción', code: 400 });
        }
        if (req.body.projectTitle.length > 20) {
            return res.status(400).json({ msg: 'El nombre del proyecto no puede exceder los 50 caracteres', code: 400 });
        }
        if (req.body.projectDescription.length > 100) {
            return res.status(400).json({ msg: 'La descripción del proyecto no puede exceder los 100 caracteres', code: 400 });
        }

        try {
            // Buscar la entidad asociada
            const entity = await models.entity.findOne({
                where: { external_id: entity_external_id },
                attributes: ['id']
            });

            if (!entity) {
                return res.status(404).json({ msg: 'Entidad no encontrada', code: 404 });
            }

            // Crear el proyecto
            const project = await models.project.create({
                name: req.body.projectTitle,
                description: req.body.projectDescription,
                entity_id: entity.id
            }, { transaction });

            // Obtener los `type_question_id` según las opciones en `securityOptions`
            const selectedOptions = Object.keys(req.body.securityOptions)
                .filter(option => req.body.securityOptions[option]);


            const typeQuestions = await models.type_question.findAll({
                where: { name: selectedOptions },
                attributes: ['id']
            });

            const typeQuestionIds = typeQuestions.map(tq => tq.id);

            if (typeQuestionIds.length === 0) {
                await transaction.commit();
                return res.status(200).json({
                    msg: "Proyecto guardado sin preguntas asociadas",
                    code: 200,
                    info: project
                });
            }
            // Obtener los `question_id` de las preguntas con los `type_question_id` encontrados
            const questions = await models.question.findAll({
                where: { type_question_id: typeQuestionIds },
                attributes: ['id']
            });

            const questionIds = questions.map(q => q.id);

            // Insertar las relaciones en `project_question`
            const projectQuestions = questionIds.map(qid => ({
                project_id: project.id,
                question_id: qid,
                state: false
            }));

            if (projectQuestions.length > 0) {
                await models.project_question.bulkCreate(projectQuestions, { transaction });
            }

            await transaction.commit();

            return res.status(200).json({
                msg: "Proyecto y preguntas asociadas guardadas correctamente",
                code: 200,
                info: project
            });

        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            return res.status(400).json({
                msg: error.message || "Ha ocurrido un error en el servidor",
                code: 400
            });
        }
    }

    async updateProject(req, res) {
        let transaction = await models.sequelize.transaction();
        const entity_external_id = req.params.entity_external_id;
        const project_external_id = req.params.project_external_id;
    
        if (!entity_external_id || !project_external_id) {
            return res.status(404).json({ msg: 'Se requiere una entidad y un proyecto', code: 404 });
        }
        if (!req.body.projectTitle || !req.body.projectDescription) {
            return res.status(400).json({ msg: 'Se requiere nombre y descripción', code: 400 });
        }
        if (req.body.projectTitle.length > 20) {
            return res.status(400).json({ msg: 'El nombre del proyecto no puede exceder los 50 caracteres', code: 400 });
        }
        if (req.body.projectDescription.length > 100) {
            return res.status(400).json({ msg: 'La descripción del proyecto no puede exceder los 100 caracteres', code: 400 });
        }
    
        try {
            // Buscar la entidad asociada
            const entity = await models.entity.findOne({
                where: { external_id: entity_external_id },
                attributes: ['id']
            });
        
            if (!entity) {
                return res.status(404).json({ msg: 'Entidad no encontrada', code: 404 });
            }
        
            // Buscar el proyecto existente
            const project = await models.project.findOne({
                where: { external_id: project_external_id, entity_id: entity.id }
            });
        
            if (!project) {
                return res.status(404).json({ msg: 'Proyecto no encontrado', code: 404 });
            }
        
            // Actualizar los campos del proyecto
            project.name = req.body.projectTitle;
            project.description = req.body.projectDescription;
            await project.save({ transaction });
        
            // Obtener los `type_question_id` según las opciones en `securityOptions`
            const selectedOptions = Object.keys(req.body.securityOptions)
                .filter(option => req.body.securityOptions[option]);
        
            const typeQuestions = await models.type_question.findAll({
                where: { name: selectedOptions },
                attributes: ['id']
            });
        
            const typeQuestionIds = typeQuestions.map(tq => tq.id);
        
            // Obtener las preguntas asociadas a los `type_question_id` seleccionados
            const questions = await models.question.findAll({
                where: { type_question_id: typeQuestionIds },
                attributes: ['id']
            });
        
            const questionIds = questions.map(q => q.id);
        
            // Obtener las relaciones existentes en `project_question` para este proyecto
            const existingProjectQuestions = await models.project_question.findAll({
                where: { project_id: project.id },
                attributes: ['question_id']
            });
        
            const existingQuestionIds = existingProjectQuestions.map(pq => pq.question_id);
        
            // Filtrar las preguntas que ya están asociadas al proyecto
            const newQuestionIds = questionIds.filter(qid => !existingQuestionIds.includes(qid));
        
            // Insertar solo las nuevas relaciones en `project_question`
            if (newQuestionIds.length > 0) {
                const projectQuestions = newQuestionIds.map(qid => ({
                    project_id: project.id,
                    question_id: qid,
                    state: false
                }));
        
                await models.project_question.bulkCreate(projectQuestions, { transaction });
            }
        
            // Eliminar relaciones que ya no están seleccionadas
            const questionsToRemove = existingQuestionIds.filter(qid => !questionIds.includes(qid));
        
            if (questionsToRemove.length > 0) {
                await models.project_question.destroy({
                    where: {
                        project_id: project.id,
                        question_id: questionsToRemove
                    },
                    transaction
                });
            }
        
            await transaction.commit();
        
            return res.status(200).json({
                msg: "Proyecto y preguntas asociadas actualizadas correctamente",
                code: 200,
                info: project
            });
        
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }
            return res.status(400).json({
                msg: error.message || "Ha ocurrido un error en el servidor",
                code: 400
            });
        }
    }



}

module.exports = ProjectController;
