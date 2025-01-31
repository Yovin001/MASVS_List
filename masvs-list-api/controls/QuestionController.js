'use strict';

const { where } = require('sequelize');
var models = require('../models');
var request = models.request;
const uuid = require('uuid');
class QuestionController {

    async getReport(req, res) {
        const { entity_external_id, project_external_id } = req.params;
    
        if (!entity_external_id || !project_external_id) {
            return res.status(400).json({ msg: 'Se requiere una entidad y un proyecto', code: 400 });
        }
    
        try {
            // Obtener la entidad
            const entity = await models.entity.findOne({
                where: { external_id: entity_external_id },
                attributes: ['id']
            });
    
            if (!entity) {
                return res.status(404).json({ msg: 'Entidad no encontrada', code: 404 });
            }
    
            // Obtener el proyecto
            const project = await models.project.findOne({
                where: { entity_id: entity.id, external_id: project_external_id },
                attributes: ['id']
            });
    
            if (!project) {
                return res.status(404).json({ msg: 'Proyecto no encontrado', code: 404 });
            }
    
            // Obtener todas las preguntas del proyecto con su tipo
            const projectQuestions = await models.project_question.findAll({
                where: { project_id: project.id },
                include: [{
                    model: models.question,
                    attributes: ['id', 'type_question_id'],
                    include: [{
                        model: models.type_question,
                        attributes: ['id', 'name']
                    }]
                }]
            });
    
            if (!projectQuestions.length) {
                return res.status(404).json({ msg: 'No se encontraron preguntas', code: 404 });
            }
    
            // Mapa para contar las preguntas aprobadas y reprobadas por tipo
            const reportMap = new Map();
    
            projectQuestions.forEach(pq => {
                const question = pq.question;
                if (!question || !question.type_question) return;
    
                const typeName = question.type_question.name;
    
                if (!reportMap.has(typeName)) {
                    reportMap.set(typeName, { name: typeName, aprobado: 0, reprobado: 0 });
                }
    
                const typeReport = reportMap.get(typeName);
                if (pq.state === true) {
                    typeReport.aprobado += 1; // Aprobado si project_question.state es true
                } else {
                    typeReport.reprobado += 1; // Reprobado si es false
                }
            });
    
            // Convertir el mapa a un array y calcular porcentajes
            const report = Array.from(reportMap.values()).map(item => {
                const total = item.aprobado + item.reprobado;
                return {
                    ...item,
                    porcentaje: total > 0 ? Math.round((item.aprobado / total) * 100) : 0
                };
            });
    
            return res.status(200).json({ msg: 'OK', code: 200, info: report });
    
        } catch (error) {
            console.error('Error en getReport:', error);
            return res.status(500).json({ msg: 'Error interno del servidor', code: 500 });
        }
    }
    
    

}

module.exports = QuestionController;
