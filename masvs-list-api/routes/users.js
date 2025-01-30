var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');
let maxFileSize = 2 * 1024 * 1024; // Inicialmente 2 MB
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const RoleController = require('../controls/RoleController');
var rolController = new RoleController();
const EntityController = require('../controls/EntityController');
var entidadController = new EntityController();
const AccountController = require('../controls/AccountController');
var cuentaController = new AccountController();
const RoleEntityController = require('../controls/RoleEntityController');
var rolEntityController = new RoleEntityController();
const RequestController = require('../controls/RequestController');
var peticionController = new RequestController();
const ProjectController = require('../controls/ProjectController');
var projectController = new ProjectController();
const ProjectQuestionController = require('../controls/ProjectQuestionController');
var projectQuestionController = new ProjectQuestionController();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
const auth = (options = { checkAdmin: false }) => async (req, res, next) => {
  const token = req.headers['x-api-token'];
  if (!token) {
    return res.status(401).json({
      msg: "No existe token",
      code: 401,
    });
  }

  try {
    require('dotenv').config();
    const llave = process.env.KEY;
    const decoded = jwt.verify(token, llave);
    req.decoded = decoded;

    const models = require('../models');
    const cuenta = models.cuenta;
    const rolEntity = models.rol_entidad;

    // Verifica que la cuenta existe
    const user = await cuenta.findOne({
      where: { external_id: req.decoded.external },
    });

    if (!user) {
      return res.status(401).json({
        msg: "Token no válido o expirado",
        code: 401,
      });
    }

    // Si se requiere verificar si es admin
    if (options.checkAdmin) {
      const isAdmin = await rolEntity.findOne({
        where: {
          id_entidad: user.id_entidad,
          id_rol: 1, // ID de administrador
        },
      });

      if (!isAdmin) {
        return res.status(403).json({
          msg: "Acceso denegado: No tiene permisos de administrador",
          code: 403,
        });
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({
      msg: "Token no válido",
      code: 401,
    });
  }
};

// GUARDAR IMAGENES 

// Función para crear configuraciones de almacenamiento de multer
const createStorage = (folderPath) => {
  return multer.diskStorage({
    destination: path.join(__dirname, folderPath),
    filename: (req, file, cb) => {
      console.log(file);
      const parts = file.originalname.split('.');
      const extension = parts[parts.length - 1];
      cb(null, uuid.v4() + "." + extension);
    }
  });
};

// Método para validar las extensiones de las fotografías
const extensionesAceptadasFoto = (req, file, cb) => {
  const allowedExtensions = ['.jpeg', '.jpg', '.png'];
  console.log(file);
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPEG, JPG y PNG.'), false);
  }
};

// Configuración de Multer con control de tamaño y tipo de archivo
// Middleware dinámico para Multer
const uploadFotoPersona = (req, res, next) => {
  const storage = createStorage('../public/images/users');
  const upload = multer({
    storage: storage,
    fileFilter: extensionesAceptadasFoto,
    limits: { fileSize: maxFileSize }, // Lee el tamaño actual de maxFileSize
  }).single('foto');
  upload(req, res, next);
};


//Global configs
router.get('/config/tamano/:zize',  auth({ checkAdmin: true }),(req, res) => {
  const size = parseInt(req.params.zize);

  if (!size || isNaN(size) || size <= 0) {
    return res.status(400).json({
      msg: "Debe proporcionar un tamaño válido en MB.",
      code: 400,
    });
  }

  maxFileSize = size * 1024 * 1024; // Convertir MB a bytes
  res.status(200).json({
    msg: `Tamaño máximo de archivo actualizado a ${size} MB.`,
    code: 200, info: size,
  });
});
router.get('/config/tamano',  auth({ checkAdmin: true }),(req, res) => {
  res.status(200).json({code: 200,
    info: maxFileSize / (1024 * 1024),
  });
});



//INICIO DE SESION
router.post('/sesion', [
  body('email', 'Ingrese un correo valido').exists().not().isEmpty().isEmail(),
  body('password', 'Ingrese una password valido').exists().not().isEmpty(),
], cuentaController.sesion)

//GET-ROL
router.get('/rol/listar',  auth({ checkAdmin: true }), rolController.listar);

//POST ROL
router.post('/rol/guardar',  auth({ checkAdmin: true }), rolController.guardar);

/*****ENTIDAD****/
router.post('/entidad/guardar', (req, res, next) => {
  uploadFotoPersona(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          msg: `El archivo es demasiado grande. Por favor, sube un archivo de menos de ${maxFileSize / (1024 * 1024)} MB.`,
          code: 413,
        });
      }
      return res.status(400).json({
        msg: "Error al cargar el archivo: " + error.message,
        code: 400,
      });
    }
    entidadController.guardar(req, res, next);
  });
});


router.put('/modificar/entidad', auth(),(req, res, next) => {
  uploadFotoPersona.single('foto')(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          msg: "El archivo es demasiado grande. Por favor, sube un archivo de menos de 2 MB.",
          code: 413
        });
      }
      return res.status(400).json({
        msg: "Error al cargar el archivo: " + error.message,
        code: 400
      });
    }
    entidadController.modificar(req, res, next);
  });
});
router.get('/listar/entidad', auth({ checkAdmin: true }),  entidadController.listar);
router.get('/listar/entidad/activos',  auth({ checkAdmin: true }), entidadController.listarActivos);
router.get('/obtener/entidad/:external', auth(), entidadController.obtener);

router.get('/cuenta/:nameCompleto',auth(),cuentaController.obtenerAccount);


/** ROL_ENTIDAD */
router.get('/rol/entidad/listar', auth(),rolEntityController.listar);
router.post('/asignar/lideres',  auth({ checkAdmin: true }), rolEntityController.asignarLideres);
router.get('/rol/entidad/obtener/lider', rolEntityController.obtenerLider);
router.get('/rol/entidad/obtener/administrador',  auth({ checkAdmin: true }), rolEntityController.obtenerAdministrador);

router.put('/cuenta/password/:external_id',auth(), [
  body('password_vieja', 'Ingrese una password valido').exists().not().isEmpty(),
  body('password_nueva', 'Ingrese una password valido').exists().not().isEmpty()
], cuentaController.cambioClave)
router.put('/cuenta/restablecer/password/:external_id', [
  body('password_nueva', 'Ingrese una password valido').exists().not().isEmpty()
], cuentaController.cambioClaveSoloNueva)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

router.get('/cuenta/token/:external_id', limiter, auth({ checkAdmin: true }), cuentaController.tokenCambioClave)
router.put('/cuenta/validar',[
  body('email', 'Ingrese un correo valido').exists().not().isEmpty().isEmail()], cuentaController.validarCambioClave)

/** PETICION */
router.get('/peticion/:type', peticionController.listarRequestes);
router.get('/aceptarechazar/peticiones/:external/:state/:rejection_reason/:approver_rejector_id', /*auth,*/ peticionController.aceptarRechazar);



/**PROJECTS */

router.get('/projects/:entity_external_id', projectController.getProjects);
router.get('/project/:entity_external_id/:project_external_id', projectController.getProject);
router.get('/project/alone/:entity_external_id/:project_external_id', projectController.getAloneProject);
router.post('/project/:entity_external_id', projectController.addProject);


/**PROJECT_QUESTION */

router.post('/project/questions/:entity_external_id/:project_external_id', projectQuestionController.updateState);

module.exports = router;  