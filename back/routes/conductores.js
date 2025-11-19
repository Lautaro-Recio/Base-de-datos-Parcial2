import express from "express";
import Conductor from "../models/conductor.js";

const router = express.Router(); // Esto crea un mini servidor donde definís todas las rutas relacionadas con automóviles.

// GET todos
router.get("/", async (req, res) => {
    const conductores = await Conductor.find();
    res.json(conductores);
});

// GET por ID
router.get("/:id", async (req, res) => {
    try {
        const conductor = await Conductor.findById(req.params.id);
        if (!conductor) return res.status(404).json({ error: "Conductor no encontrado" });
        res.json(conductor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST crear
router.post("/", async (req, res) => {
    try {
        const body = { ...req.body }; // Crea un nuevo conductor con los datos enviados en el body de la peticion y valida los campos segun el schema
        if (Array.isArray(body.infracciones)) {
            body.infracciones = body.infracciones.map((inf) => {
                // Permitir subdoc completo o solo ID
                if (inf && typeof inf === "object" && (inf.multa || inf._id)) {
                    return {
                        multa: inf.multa || inf._id,
                        estado: inf.estado || "Por pagar",
                    };
                }
                // Es un ID crudo
                return { multa: inf, estado: "Por pagar" };
            });
        }
        const nuevo = new Conductor(body);
        await nuevo.save();
        res.json({ mensaje: "Conductor agregado", conductor: nuevo });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT actualizar
router.put("/:id", async (req, res) => {
    try {
        const body = { ...req.body };
        if (Array.isArray(body.infracciones)) {
            body.infracciones = body.infracciones.map((inf) => {
                if (inf && typeof inf === "object" && (inf.multa || inf._id)) {
                    return {
                        multa: inf.multa || inf._id,
                        estado: inf.estado,
                    };
                }
                return { multa: inf, estado: "Por pagar" };
            });
        }
        const actualizado = await Conductor.findByIdAndUpdate(req.params.id, body, {
            new: true
        });
        if (!actualizado) return res.status(404).json({ error: "Conductor no encontrado" });
        res.json({ mensaje: "Conductor actualizado", conductor: actualizado });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE eliminar
router.delete("/:id", async (req, res) => {
    try {
        const eliminado = await Conductor.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(404).json({ error: "Conductor no encontrado" });
        res.json({ mensaje: "Conductor eliminado", conductor: eliminado });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;