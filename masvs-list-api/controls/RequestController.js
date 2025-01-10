'use strict';

var models = require('../models');
var request = models.request;

class RequestController {
    async listarRequestes(req, res) {
        try {
            if (!req.params.type) {
                res.status(400);
                res.json({ msg: 'Se requiere un type de request', code: 400 });
            }
            var listar = await request.findAll({
                where: { state: 'ES', type: req.params.type },
                include: {
                    model: models.account,foreignKey: 'id_account', attributes: ['email', 'external_id'], 
                    include: { model: models.entity, foreignKey: 'id_entity', attributes: ['first_name', 'last_name'] }
                },
                attributes: ['request', 'external_id', 'createdAt']
            });
            res.status(200);
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Algo salio mal en listar requestes', code: 500, info: error });
        }
    }

    async aceptarRechazar(req, res) {
        try {
            var requestNew = await request.findOne({ where: { external_id: req.params.external } });
            if (requestNew === null) {
                res.status(400);
                res.json({ msg: 'Request no encontarda', code: 400 });
            } else {
                var accountAc = await models.account.findOne({ where: { id: requestNew.id_account } });
                var person = await models.entity.findOne({where: {id: accountAc.id_entity}});
                if (req.params.state == '1') {
                    requestNew.state = 'AC';
                    accountAc.state = 'ACEPTADO';
                    requestNew.id_aceptador_rechazador = req.params.approver_rejector_id;
                    person.state=1;
                } else {
                    requestNew.state = 'RE';
                    accountAc.state = 'DENEGADO';
                    requestNew.rejection_reason = req.params.rejection_reason;
                    requestNew.approver_rejector_id = req.params.approver_rejector_id;
                    person.state=0;
                }
                var uuid = require('uuid');
                requestNew.external_id = uuid.v4();
                accountAc.external_id = uuid.v4();
                person.external_id = uuid.v4();
                var result = await requestNew.save();
                var resultCuenta = await accountAc.save();
                var resultPerson = await person.save();
                if (result === null || resultCuenta === null || resultPerson === null) {
                    res.status(400);
                    res.json({
                        msg: "No se guardado la informacion de la request",
                        code: 400
                    });
                } else {
                    res.status(200);
                    res.json({
                        msg: ((req.params.state === '1') ? 'Se ha aceptado la petición' : 'Se ha rechazado la petición'),
                        code: 200, info: resultCuenta.external_id
                    });
                }
            }

        } catch (error) {
            res.status(500);
            res.json({ msg: 'Algo salio mal en requestes', code: 500, info: error });
        }
    }

}

module.exports = RequestController;
