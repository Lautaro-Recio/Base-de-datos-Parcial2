import express from "express";
import Multa from "../models/multa.js";

const router = express.Router();

// GET todos
router.get("/", async (req, res) => {
    const multas = await Multa.find();
    res.json(multas);
});

// GET por ID
router.get("/:id", async (req, res) => {
    try {
        const multa = await Multa.findById(req.params.id);
        if (!multa) return res.status(404).json({ error: "Multa no encontrada" });
        res.json(multa);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST crear
router.post("/", async (req, res) => {
    try {
        const nueva = new Multa(req.body);
        await nueva.save();
        res.json({ mensaje: "Multa agregada", multa: nueva });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT actualizar
router.put("/:id", async (req, res) => {
    try {
        const actualizada = await Multa.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        if (!actualizada) return res.status(404).json({ error: "Multa no encontrada" });
        res.json({ mensaje: "Multa actualizada", multa: actualizada });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE eliminar
router.delete("/:id", async (req, res) => {
    try {
        const eliminada = await Multa.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(404).json({ error: "Multa no encontrada" });
        res.json({ mensaje: "Multa eliminada", multa: eliminada });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;