import mongoose from "mongoose";

const automovilSchema = new mongoose.Schema({
    patente: String,
    marca: String,
    modelo: String,
    anio: Number,
    conductor_id: { type: mongoose.Schema.Types.ObjectId, ref: "conductor" },
});

export default mongoose.model("automovil", automovilSchema);