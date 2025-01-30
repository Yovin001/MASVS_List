'use strict';

const { where } = require('sequelize');
var models = require('../models');
var request = models.request;
const uuid = require('uuid');
class QuestionController {

    async getReport(req, res) {
        const entity_external_id = req.params.entity_external_id;
        const project_external_id = req.params.project_external_id;
    
        if (!entity_external_id || !project_external_id) {
            return res.status(404).json({ msg: 'Se requiere una entidad', code: 404 });
        }
    
        try {
            const entity = await models.entity.findOne({ where: { external_id: entity_external_id }, attributes: ['id'] });
            // Obtener el proyecto
            const project = await models.project.findOne({
                where: { entity_id: entity.id, external_id: project_external_id }
            });
    
            if (!project) {
                return res.status(404).json({ msg: 'Proyecto no encontrado', code: 404 });
            }
    
            // Obtener las preguntas del proyecto
            const project_questions = await models.project_question.findAll({
                where: { project_id: project.id }
            });
    
            if (!project_questions || project_questions.length === 0) {
                return res.status(404).json({ msg: 'No se encontraron preguntas', code: 404 });
            }
    
            // Obtener los IDs de las preguntas
            const questionIds = project_questions.map(pq => pq.question_id);
    
            // Obtener las preguntas completas
            const questions = await models.question.findAll({
                where: { id: questionIds }
            });
    
            // Obtener los IDs de los tipos de preguntas
            const typeQuestionsIds = questions.map(q => q.type_question_id);
    
            // Obtener los tipos de preguntas
            const typeQuestions = await models.type_question.findAll({
                attributes: ['name', 'id']
            });
    
            // Crear un mapa para contar las preguntas aprobadas y reprobadas por tipo
            const report = typeQuestions.map(type => {
                const questionsOfType = questions.filter(q => q.type_question_id === type.id);
    
                // Contar las preguntas aprobadas (state = false) y reprobadas (state = true)
                const aprobado = questionsOfType.filter(q => q.state === false).length;
                const reprobado = questionsOfType.filter(q => q.state === true).length;
    
                return {
                    name: type.name,
                    aprobado: aprobado,
                    reprobado: reprobado
                };
            });
    
            // Devolver la respuesta
            return res.status(200).json(report);
        } catch (error) {
            console.error('Error en getReport:', error);
            return res.status(500).json({ msg: 'Error interno del servidor', code: 500 });
        }
    }


}

module.exports = QuestionController;
