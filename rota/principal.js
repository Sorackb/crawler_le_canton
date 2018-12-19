const express = require('express');
const controlador = require('../controlador/principal');
const router = express.Router();

router.post('/buscar', controlador.buscar);

module.exports = router;