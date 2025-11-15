import mongoose from "mongoose";

const multaSchema = new mongoose.Schema({
    tipo: String,
    monto: Number,
    motivo: String,
});

export default mongoose.model("Multa", multaSchema);