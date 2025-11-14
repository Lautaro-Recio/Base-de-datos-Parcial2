import mongoose from "mongoose";

const automovilSchema = new mongoose.Schema({
    patente: String,
    marca: String,
    modelo: String,
    anio: Number,
    conductor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Conductor" },
});

export default mongoose.model("Automovil", automovilSchema);