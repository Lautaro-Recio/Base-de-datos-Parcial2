import mongoose from "mongoose";

const conductorSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    dni: String,
    direccion: String,
    telefono: String,
});

export default mongoose.model("conductor", conductorSchema);