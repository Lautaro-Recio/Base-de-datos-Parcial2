const mongoose = require("mongoose");
const dataSchema = mongoose.Schema;

const ConductorSchema = new dataSchema({
    nombre: {String},
    dni: {String},
    licenciaValida: {Boolean},
    patente: {String},
    modelo: {String},
    tieneInfracciones: {Boolean}
});

module.exports = mongoose.model("Conductor", ConductorSchema);
