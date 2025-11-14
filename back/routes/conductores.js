import express from "express";
import conductor from "../models/conductor";

const router = express.Router();

router.get("/", async (req, res) => {
    const conductores = await conductor.find();
    res.json(conductores);
});

router.get("/", async (req, res) => {
    const nuevo = new conductor(req.body);
    await nuevo.save();
    res.json({ mensaje: "Conductor agregado", conductor: nuevo });
})

export default router;