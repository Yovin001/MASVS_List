'use strict';

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

            const projectsRenamed = projects.map(proj => ({
                project_id: proj.id,
                external_id: proj.external_id,
                name: proj.name,
                description: proj.description,
                createdAt: proj.createdAt,
                state: proj.state
            }));

            if (!projects) {
                res.status(404);
                res.json({ msg: 'No se encontraron proyectos', code: 404 });
            }
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: projectsRenamed });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Algo salio mal en listar requestes', code: 500, info: error });
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
                throw new Error("Entidad no encontrada");
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
    
}

module.exports = ProjectController;
