import express from "express";
import Automovil from "../models/automovil.js"; 

const router = express.Router(); // Esto crea un mini servidor donde definís todas las rutas relacionadas con automóviles.

// GET todos
router.get("/", async (req, res) => {
    const autos = await Automovil.find().populate("conductor_id"); // populate es una función de Mongoose que sirve para reemplazar un ID por el documento completo al que hace referencia.
    res.json(autos);
});

// GET por ID
router.get("/:id", async (req, res) => {
    try {
        const auto = await Automovil.findById(req.params.id).populate("conductor_id");
        if (!auto) return res.status(404).json({ error: "Automóvil no encontrado" });
        res.json(auto);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST crear
router.post("/", async (req, res) => {
    try {
        const nuevo = new Automovil(req.body); // Crea un nuevo automovil con los datos enviados en el body de la peticion y valida los campos segun el schema
        await nuevo.save(); // Guarda el automovil en la base de datos
        res.json({ mensaje: "Automóvil agregado", automovil: nuevo });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT actualizar
router.put("/:id", async (req, res) => {
    try {
        const actualizado = await Automovil.findByIdAndUpdate(req.params.id, req.body, { // Actualiza el automovil con el id enviado en la peticion
            new: true // Retorna el automovil actualizado
        });
        if (!actualizado) return res.status(404).json({ error: "Automóvil no encontrado" }); // Si no se encuentra el automovil, retorna un error
        res.json({ mensaje: "Automóvil actualizado", automovil: actualizado });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE eliminar
router.delete("/:id", async (req, res) => {
    try {
        const eliminado = await Automovil.findByIdAndDelete(req.params.id); // Elimina el automovil con el id enviado en la peticion
        if (!eliminado) return res.status(404).json({ error: "Automóvil no encontrado" }); // Si no se encuentra el automovil, retorna un error
        res.json({ mensaje: "Automóvil eliminado", automovil: eliminado }); // Retorna el automovil eliminado
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;