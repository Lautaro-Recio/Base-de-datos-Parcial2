import mongoose from "mongoose";

const conductorSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    dni: String,
    direccion: String,
    telefono: String,
    patente: String,
    infracciones: [{
        multa: { type: mongoose.Schema.Types.ObjectId, ref: "Multa", required: true }, // multa no guarda la multa completa, Guarda solo el ObjectId de la multa, ref: "Multa" le dice a Mongoose
        estado: { type: String, default: "Por pagar" }
    }]
});

export default mongoose.model("Conductor", conductorSchema);