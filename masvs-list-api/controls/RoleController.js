'use strict';

var models = require('../models');
const superUsuario ='ADMINISTRADOR SYS';
var role = models.role;

class RoleController {
    async listar(req, res) {
        try {
            var listar = await role.findAll({
                attributes: ['name', 'external_id', 'id', 'state'],
                where: {
                    name: { [models.Sequelize.Op.not]: superUsuario } 
                }
            });
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            console.error('Error al listar rolees:', error);
            res.status(500).json({ msg: 'Se produjo un error al listar rolees', code: 500, error: error.message });
        }
    }
    
    async guardar(req, res) {
        try {
            const data = {
                "name": req.body.name,
            }
            let transaction = await models.sequelize.transaction();
            await role.create(data, transaction);
            await transaction.commit();
            res.json({
                msg: "SE HA REGISTRADO EL ROL CON ÉXTIO",
                code: 200
            });

        } catch (error) {
            if (transaction) await transaction.rollback();
            if (error.errors && error.errors[0].message) {
                res.json({ msg: error.errors[0].message, code: 200 });
            } else {
                res.json({ msg: error.message, code: 200 });
            }
        }
    }
}

module.exports = RoleController;