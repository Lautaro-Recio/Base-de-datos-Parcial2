import express from "express";
import automovil from "../models/automovil";

const router = express.Router();

router.get("/", async (req, res) => {
    const automoviles = await automovil.find();
    res.json(automoviles);
});

router.get("/", async (req, res) => {
    const nuevo = new automovil(req.body);
    await nuevo.save();
    res.json({ mensaje: "Automóvil agregado", automovil: nuevo });
})

export default router;