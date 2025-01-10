'use strict';

var models = require('../models');
const roleLider = 'LIDER DE CALIDAD';
const roleAdministrador = 'ADMINISTRADOR SYS';
const uuid = require('uuid');

class RoleEntityController {

    async listar(req, res) {
        try {
            const id_entity = req.query.id_entity;

            if (!id_entity) {
                return res.status(400).json({ msg: "ID de entity no proporcionado", code: 400 });
            }
    
            const listar = await models.role_entity.findAll({
                where: { id_entity: id_entity },
                include: [
                    {
                        model: models.role,
                        where: { state: true },
                        attributes: ['external_id', 'name', 'state']
                    }
                ]
            });

            if (listar.length === 0) {
                return res.status(404).json({ msg: "No se encontraron rolees para la entity proporcionada", code: 404 });
            }
    
            res.json({ msg: 'Roles encontrados', code: 200, info: listar });
        } catch (error) {
            console.error("Error al listar rolees:", error);
            res.status(500).json({ msg: 'Error al listar rolees', code: 500, info: error.message });
        }
    }    
    async obtenerLider(req, res) {
        try {
            const id_entity = req.query.id_entity;

            if (!id_entity) {
                return res.status(400).json({ msg: "ID de entity no proporcionado", code: 400 });
            }
    
            const listar = await models.role_entity.findAll({
                where: { id_entity: id_entity },
                include: [
                    {
                        model: models.role,
                        where: { state: true ,name:roleLider},
                        attributes: ['external_id', 'name', 'state']
                    }
                ]
            });

            if (listar.length === 0) {
                return res.status(404).json({ msg: "No es lider de calidad", code: 404 });
            }
    
            res.json({ msg: 'Es lider de calidad', code: 200, info: listar });
        } catch (error) {
            console.error("Error al listar rolees:", error);
            res.status(500).json({ msg: 'Error al listar', code: 500, info: error.message });
        }
    }    
    
    async obtenerAdministrador(req, res) {
        try {
            const id_entity = req.query.id_entity;

            if (!id_entity) {
                return res.status(400).json({ msg: "ID de entity no proporcionado", code: 400 });
            }
    
            const listar = await models.role_entity.findAll({
                where: { id_entity: id_entity },
                include: [
                    {
                        model: models.role,
                        where: { state: true ,name:roleAdministrador},
                        attributes: ['external_id', 'name', 'state']
                    }
                ]
            });

            if (listar.length === 0) {
                return res.status(404).json({ msg: "No es administrador del sistema", code: 404 });
            }
    
            res.json({ msg: 'Es administrador del sistema', code: 200, info: listar});
        } catch (error) {
            console.error("Error al listar rolees:", error);
            res.status(500).json({ msg: 'Error al listar', code: 500, info: error.message });
        }
    }  

    async asignarLideres(req, res) {
        let transaction;
        try {
            transaction = await models.sequelize.transaction();
    
            const { lideres } = req.body;
    
            if (!lideres) {
                return res.status(400).json({ msg: "Faltan datos requeridos", code: 400 });
            }
            if (!Array.isArray(lideres) || lideres.length === 0) {
                return res.status(400).json({ msg: "No se pueden asignar lideres vacíos", code: 400 });
            }
    
            let asignaciones = [];
            for (const lider of lideres) {
                const entity = await models.entity.findOne({
                    where: { id: lider.id_entity, state: 1 }
                });
                const nameRole = await models.role.findOne({ where: { name: roleLider }, attributes: ['id'] });
                if (!entity) {
                    return res.status(404).json({ msg: `Entity con ID ${lider.id_entity} no encontrada o inactiva`, code: 404 });
                }
    
                const roleExistente = await models.role_entity.findOne({
                    where: { id_entity: lider.id_entity, id_role: nameRole.id } 
                });
                if (roleExistente) {
                    return res.status(409).json({ msg: 'Ya tiene asignado el role de LÍDER DE CALIDAD', code: 409 });
                }
    
                const nuevaAsignacion = await models.role_entity.create({
                    id_entity: lider.id_entity,
                    id_role: nameRole,id, 
                    external_id: uuid.v4()
                }, { transaction });
                asignaciones.push(nuevaAsignacion);
            }
    
            await transaction.commit();
    
            res.json({
                msg: asignaciones.length > 1 ? "Líderes asignados correctamente" : "Líder asignado correctamente",
                code: 200,
                info: asignaciones
            });
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.error("Error al asignar lideres:", error);
            res.status(500).json({ msg: error.message || "Error interno del servicio", code: 500 });
        }
    }
    


}

module.exports = RoleEntityController;