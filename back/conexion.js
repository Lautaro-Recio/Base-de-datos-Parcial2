
import mongoose from "mongoose"; // Importa mongoose, que es la librería que te permite conectarte a MongoDB.
import dotenv from "dotenv"; // Importa dotenv, que te permite cargar variables de entorno desde un archivo .env.

dotenv.config(); // Carga las variables de entorno desde el archivo .env.

export async function conectar() {
    try {
        await mongoose.connect(process.env.URI, { // conecta a MongoDb a traves de los valores dentro del archivo .env
            dbName: process.env.DB_NAME,
        });

        console.log("✅ Conectado a MongoDB con Mongoose");
        
    } catch (error) {
        console.error("❌ Error al conectar a MongoDB:", error);
        process.exit(1); // sale del programa con un error
    }
}
