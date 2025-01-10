'use strict';
const { body, validationResult, check } = require('express-validator');
const models = require('../models');
var entity = models.entity;
const bcrypt = require('bcrypt');
const saltRounds = 8;
const path = require('path');
const uuid = require('uuid');
const fs = require('fs');
const { where } = require('sequelize');

class EntityController {

    async listar(req, res) {
        try {
            var listar = await entity.findAll({
                attributes: ['last_name', 'first_name', 'external_id', 'photo', 'phone', 'birth_date', 'state'],
                include: [
                    {
                        model: models.account,
                        as: 'account',
                        attributes: ['email'],
                    },
                ],
            });
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Error al listar personas: ' + error.message, code: 500, info: error });
        }
    }

    async listarActivos(req, res) {
        try {
            var listar = await entity.findAll({
                where: { state: 1 },
                attributes: ['id', 'last_name', 'first_name', 'external_id', 'photo', 'phone', 'birth_date', 'state'],
                include: [
                    {
                        model: models.account,
                        as: 'account',
                        attributes: ['email'],
                    },
                ],
            });
            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            res.status(500);
            res.json({ msg: 'Error al listar personas: ' + error.message, code: 500, info: error });
        }
    }


    async obtener(req, res) {
        const external = req.params.external;
        var lista = await entity.findOne({
            where: {
                external_id: external
            },
            attributes: [
                'id',
                'last_name',
                'first_name',
                'external_id',
                'birth_date',
                'phone',
                'state',
                'photo'
            ],
        });
        if (lista === null) {
            return res.status(400).json({
                msg: 'NO EXISTE EL REGISTRO',
                code: 400,
                info: listar
            });
        }
        return res.status(200).json({
            msg: 'OK!',
            code: 200,
            info: lista
        });
    }


    async guardar(req, res) {
        let transaction = await models.sequelize.transaction();
        const saltRounds = 10;

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "DATOS INCOMPLETOS",
                    code: 400,
                    errors: errors.array()
                });
            }

            if (!req.body.password) {
                return res.status(400).json({
                    msg: "FALTA INGRESAR LA CLAVE",
                    code: 400
                });
            }

            const passwordHash = (password) => {
                if (!password) {
                    throw new Error("La password es obligatoria");
                }
                const salt = bcrypt.genSaltSync(saltRounds);
                return bcrypt.hashSync(password, salt);
            };
            const photoFilename = req.file ? req.file.filename : 'USUARIO_ICONO.png';

            const data = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                birth_date: req.body.birth_date,
                phone: req.body.phone,
                photo: photoFilename,
                account: {
                    email: req.body.email,
                    password: passwordHash(req.body.password), 
                    state: 'ACEPTADO',
                    external_id: uuid.v4()
                },
                role_entity: {
                    id_role: 2
                },
                external_id: uuid.v4()
            };

            const entity = await models.entity.create(data, {
                include: [{ model: models.account, as: "account" },{model: models.role_entity, as: "role_entity"}],
                transaction
            });

            await transaction.commit();

            return res.status(200).json({
                msg: "SE HAN REGISTRADO LOS DATOS CON ÉXITO",
                code: 200
            });

        } catch (error) {
            if (req.file && req.file.path) {
                fs.unlinkSync(path.join(__dirname, '../public/images/users', req.file.filename));
            }

            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }

            if (error.name === 'SequelizeUniqueConstraintError' && error.errors[0].path === 'email') {
                return res.status(400).json({
                    msg: "ESTE email SE ENCUENTRA REGISTRADO EN EL SISTEMA",
                    code: 400
                });
            }

            return res.status(400).json({
                msg: error.message || "Ha ocurrido un error en el servidor",
                code: 400
            });
        }
    }

    async modificar(req, res) {

        try {
            const entityAux = await entity.findOne({
                where: { external_id: req.body.external_id }
            });

            if (!entityAux) {
                return res.status(400).json({ msg: "NO EXISTE EL REGISTRO", code: 400 });
            }

            const accountAux = await models.account.findOne({
                where: { id_entity: entityAux.id }
            });

            if (!accountAux) {
                return res.status(400).json({ msg: "NO SE ENCONTRÓ LA CUENTA ASOCIADA A ESTA ENTIDAD", code: 400 });
            }

            let imagenAnterior = entityAux.photo;

            if (req.file) {
                if (imagenAnterior) {
                    const imagenAnteriorPath = path.join(__dirname, '../public/images/users/', imagenAnterior);
                    fs.unlink(imagenAnteriorPath, (err) => {
                        if (err) {
                            console.log('Error al eliminar la imagen anterior:', err);
                        } else {
                            console.log("eliminada: " + imagenAnterior);
                        }
                    });
                }
                imagenAnterior = req.file.filename;
            }

            entityAux.first_name = req.body.first_name;
            entityAux.last_name = req.body.last_name;
            entityAux.state = req.body.state;
            entityAux.phone = req.body.phone;
            entityAux.birth_date = req.body.birth_date;
            accountAux.state = req.body.state;
            entityAux.photo = imagenAnterior;
            entityAux.external_id = uuid.v4();

            const result = await entityAux.save();
            await accountAux.save();

            if (!result) {
                return res.status(400).json({ msg: "NO SE HAN MODIFICADO SUS DATOS, VUELVA A INTENTAR", code: 400 });
            }

            return res.status(200).json({ msg: "SE HAN MODIFICADO SUS DATOS CON ÉXITO", code: 200 });
        } catch (error) {
            console.error("Error en el servidor:", error);
            return res.status(400).json({ msg: "Error en el servidor", error, code: 400 });
        }
    }


}
module.exports = EntityController;