import mongoose from "mongoose";

const multaSchema = new mongoose.Schema({
    tipo: String,
    monto: Number,
    fecha: { type: Date, default: Date.now },
    pagada: { type: Boolean, default: false },
    automovil_id: { type: mongoose.Schema.Types.ObjectId, ref: "automovil" },
})

export default mongoose.model("multa", multaSchema);