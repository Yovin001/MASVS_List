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
                attributes: ['external_id', 'name', 'description', 'createdAt', 'state']
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

    async addProject(req, res) {

        let transaction = await models.sequelize.transaction();
        const entity_external_id = req.params.entity_external_id;
        if (!entity_external_id) {
            res.status(404);
            res.json({ msg: 'Se requiere una entidad', code: 404 });
        }
        if (!req.body.projectTitle || !req.body.projectDescription) {
            res.status(400);
            res.json({ msg: 'Se requiere nombre y descripción', code: 400 });
        }

        try {
            const entity = await models.entity.findOne({ where: { external_id: entity_external_id }, attributes: ['id'] });
            const data = {
                name: req.body.projectTitle,
                description: req.body.projectDescription, 
                entity_id: entity.id
            };

            const project = await models.project.create(data);

            await transaction.commit();

            return res.status(200).json({
                msg: "SE HAN GUARDADO EL PROYECTO",
                code: 200, info: project
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
