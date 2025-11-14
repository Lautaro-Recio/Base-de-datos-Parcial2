import express from "express";
import multa from "../models/multa";

const router = express.Router();

router.get("/", async (req, res) => {
    const multas = await multa.find();
    res.json(multas);
});

router.get("/", async (req, res) => {
    const nuevo = new multa(req.body);
    await nuevo.save();
    res.json({ mensaje: "Multa agregado", multa: nuevo });
})

export default router; 