import mongoose from "mongoose";

const conductorSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    dni: String,
    direccion: String,
    telefono: String,
    patente: String,
    infracciones: [{
        multa: { type: mongoose.Schema.Types.ObjectId, ref: "Multa", required: true },
        estado: { type: String, default: "Por pagar" }
    }]
});

export default mongoose.model("Conductor", conductorSchema);