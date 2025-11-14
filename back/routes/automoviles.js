import express from "express";
import Automovil from "../models/automovil.js";

const router = express.Router();

// GET todos
router.get("/", async (req, res) => {
    const autos = await Automovil.find().populate("conductor_id");
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
        const nuevo = new Automovil(req.body);
        await nuevo.save();
        res.json({ mensaje: "Automóvil agregado", automovil: nuevo });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT actualizar
router.put("/:id", async (req, res) => {
    try {
        const actualizado = await Automovil.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        if (!actualizado) return res.status(404).json({ error: "Automóvil no encontrado" });
        res.json({ mensaje: "Automóvil actualizado", automovil: actualizado });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE eliminar
router.delete("/:id", async (req, res) => {
    try {
        const eliminado = await Automovil.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(404).json({ error: "Automóvil no encontrado" });
        res.json({ mensaje: "Automóvil eliminado", automovil: eliminado });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;