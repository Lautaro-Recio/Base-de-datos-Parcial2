import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function conectar() {
    try {
        await mongoose.connect(process.env.URI, {
            dbName: process.env.DB_NAME,
        });

        console.log("✅ Conectado a MongoDB con Mongoose");
        
    } catch (error) {
        console.error("❌ Error al conectar a MongoDB:", error);
        process.exit(1);
    }
}