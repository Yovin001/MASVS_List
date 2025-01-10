var models = require('../models')
var account = models.account;

const { validationResult } = require('express-validator');

const bcrypt = require('bcrypt');
const saltRounds = 8;

let jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const esClaveValida = function (password, passwordUser) {
    return bcrypt.compareSync(passwordUser, password);
}
class AccountController {

    async sesion(req, res) {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }
            var login = await account.findOne({
                where: {
                    email: req.body.email
                },
                include: [{
                    model: models.entity,
                    as: "entity"
                }]
            });
            if (!login)
                return res.status(400).json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 400
                })
            var role = await models.role_entity.findOne({
                where: {
                    entity_id: login.entity.id
                }
            });


            if (!login.state) {
                return res.status(400).json({
                    msg: "CUENTA DESACTIVADA",
                    code: 400
                });
            }
            if (esClaveValida(login.password, req.body.password)) {
                const tokenData = {
                    external: login.external_id,
                    email: login.email,
                    check: true
                };

                require('dotenv').config();
                const llave = process.env.KEY;
                const token = jwt.sign(
                    tokenData,
                    llave,
                    {
                        expiresIn: '2h'
                    });
                return res.status(200).json({
                    msg: "Bievenido " + login.entity.first_name,
                    info: {
                        token: token,
                        user: {
                            email: login.email,
                            first_name: login.entity.first_name,
                            last_name: login.entity.last_name,
                            user: login.entity,
                            role: role.id_role,
                            external_account: login.external_id,
                        },
                    },
                    code: 200
                })
            } else {
                return res.status(401).json({
                    msg: "CLAVE INCORRECTA",
                    code: 401
                })
            }

        } catch (error) {
            console.log(error);
            if (error.errors && error.errors[0].message) {
                return res.status(400).json({
                    msg: error.errors[0].message,
                    code: 400
                });
            } else {
                return res.status(400).json({
                    msg: "Ha ocurrido un error en el servidor",
                    code: 400
                });
            }
        }
    }

    async obtenerAccount(req, res) {
        try {
            if (!req.params.nameCompleto) {
                return res.status(400).json({
                    msg: "FALTA EL NOMBRE COMPLETO O PARCIAL EN LA SOLICITUD",
                    code: 400
                });
            }
            const nameCompleto = req.params.nameCompleto.trim();
            const condicionesBusqueda = {
                [Op.or]: [
                    {
                        first_name: {
                            [Op.like]: `%${nameCompleto}%`
                        }
                    },
                    {
                        last_name: {
                            [Op.like]: `%${nameCompleto}%`
                        }
                    }
                ]
            };
            var accountsEncontradas = await models.entity.findAll({
                where: condicionesBusqueda,
                limit: 10 // Limitar los resultados a 10
            });

            if (accountsEncontradas.length === 0) {
                return res.status(404).json({
                    msg: "NO SE ENCONTRARON USUARIOS",
                    code: 404
                });
            }
            const accountsInfo = accountsEncontradas.map(entity => ({
                first_name: entity.first_name,
                last_name: entity.last_name,
                id: entity.id,
                photo: entity.photo
            }));

            return res.status(200).json({
                msg: "Usuarios Encontrados",
                info: accountsInfo,
                code: 200
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                msg: "Error en el servidor",
                code: 500
            });
        }
    }
    async cambioClave(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }
            const id_account = req.params.external_id;
            const account = await models.account.findOne({ where: { external_id: id_account } });

            if (!account) {
                return res.status(404).json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 404
                });
            }
            const salt = bcrypt.genSaltSync(saltRounds);
            if (esClaveValida(account.password, req.body.password_vieja)) {
                const passwordHash_nueva = bcrypt.hashSync(req.body.password_nueva, salt);
                account.password = passwordHash_nueva;
                const cuantaActualizada = await account.save();
                if (!cuantaActualizada) {
                    return res.status(400).json({ msg: "NO SE HAN MODIFICADO SUS DATOS, VUELVA A INTENTAR", code: 400 });
                } else {
                    return res.status(200).json({ msg: "CLAVE MODIFICADA CON ÉXITO", code: 200 });
                }
            } else {
                return res.status(401).json({
                    msg: "CLAVE INCORRECTA",
                    code: 401
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                msg: "Error en el servidor",
                code: 500
            });
        }
    }
    async cambioClaveSoloNueva(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }

            const id_account = req.params.external_id;
            const account = await models.account.findOne({ where: { external_id: id_account } });

            if (!account) {
                return res.status(404).json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 404
                });
            }

            const salt = bcrypt.genSaltSync(saltRounds);
            const passwordHash_nueva = bcrypt.hashSync(req.body.password_nueva, salt);
            account.password = passwordHash_nueva;
            const accountActualizada = await account.save();

            if (!accountActualizada) {
                return res.status(400).json({
                    msg: "NO SE HAN MODIFICADO SUS DATOS, VUELVA A INTENTAR",
                    code: 400
                });
            }
            console.log('CLaves');
            return res.status(200).json({
                msg: "CLAVE MODIFICADA CON ÉXITO",
                code: 200
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                msg: "Error en el servidor",
                code: 500
            });
        }
    }


    async tokenCambioClave(req, res) {
        if (!req.params.external_id) {
            return res.status(400).json({
                msg: "FALTAN DATOS",
                code: 400
            });
        } else {
            const account = await models.account.findOne({ where: { external_id: req.params.external_id } });
            if (account) {
                const tokenData = {
                    external: account.external_id,
                    email: account.email,
                    check: true
                };

                require('dotenv').config();
                const llave = process.env.KEY;
                const token = jwt.sign(
                    tokenData,
                    llave,
                    {
                        expiresIn: '10m'
                    });
                return res.status(200).json({
                    msg: "Token generado",
                    info: {
                        token: token
                    },
                    code: 200
                })
            } else {
                return res.status(400).json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 400
                });
            }
        }
    }

    async validarCambioClave(req, res) {
        const transaction = await models.sequelize.transaction();
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    msg: "FALTAN DATOS",
                    code: 400,
                    errors: errors.array()
                });
            }
            const account = await models.account.findOne({ where: { email: req.body.email, state: "ACCEPTED" } });
            if (!account) {
                return res.status(200).json({
                    code: 200
                });
            } else {
                var listar = await models.request.findOne({ where: { state: 'ES', type: "CC", id_account: account.id } });
                if (listar) {
                    return res.status(200).json({
                        code: 200, msg: "Ya existe una petición en espera"
                    });
                } else {
                    const request = {
                        request: "Cambio de Clave",
                        type: "CC",
                        id_account: account.id
                    };
                    await models.request.create(request), { transaction };
                    await transaction.commit();
                    res.json({ code: 200 });
                }
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                msg: "Error en el servidor",
                code: 500
            });
        }
    }


}
module.exports = AccountController;