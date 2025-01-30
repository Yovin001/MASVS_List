'use strict';

const { where } = require('sequelize');
var models = require('../models');
var request = models.request;
const uuid = require('uuid');
class ProjectQuestionController {

    async updateState(req, res) {
        let transaction = await models.sequelize.transaction(); // Iniciar una transacción
        const entity_external_id = req.params.entity_external_id;
        const project_external_id = req.params.project_external_id;
    
        // Validar que los datos requeridos estén presentes
        if (!entity_external_id || !project_external_id || !req.body.questions) {
            return res.status(404).json({ msg: 'Faltan datos', code: 404 });
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
    
            // Buscar el proyecto asociado
            const project = await models.project.findOne({
                where: { entity_id: entity.id, external_id: project_external_id }
            });
    
            if (!project) {
                return res.status(404).json({ msg: 'Proyecto no encontrado', code: 404 });
            }
    
            // Recorrer la lista de preguntas y actualizar cada una
            for (const questionData of req.body.questions) {
                const { question_id, state , id} = questionData;
                await models.project_question.update(
                    { state }, 
                    {
                        where: {
                            project_id: project.id, 
                            question_id: question_id, 
                            id: id
                        },
                        transaction, // Usar la transacción
                    }
                );
            }
    
            await transaction.commit(); // Confirmar la transacción
            return res.status(200).json({ msg: 'Estados actualizados correctamente', code: 200 });
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback(); // Revertir la transacción en caso de error
            }
            return res.status(400).json({
                msg: error.message || "Ha ocurrido un error en el servidor",
                code: 400,
            });
        }
    }


}

module.exports = ProjectQuestionController;
