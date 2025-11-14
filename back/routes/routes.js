const express = require("express");
const Model = require("../models/models");
const routes = express.Router();

routes.get("/", (req, res) => {
    res.send("Hola mundo");
});

routes.post("/post", async (req, res) => {
    const data = new Model({
        nombre: req.body.nombre,
        dni: req.body.dni,
        licenciaValida: req.body.licenciaValida,
        patente: req.body.patente,
        modelo: req.body.modelo,
        tieneInfracciones: req.body.tieneInfracciones
    });
    try {
        await data.save();
        console.log(req.body);
        res.status(200).json("Conductor guardado exitosamente");
    } catch (error) {
        console.log(error);
        res.status(400).json({messasge: error.message});
    }
});
module.exports = routes;
