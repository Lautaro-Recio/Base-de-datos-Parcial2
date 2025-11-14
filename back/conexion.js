import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const uri = process.env.URI;

async function conectar() {
    try {
        console.log("✅ Conectado a MongoDB Atlas");
        const cliente = new MongoClient(uri)
        await cliente.connect()
        const db = cliente.db(process.env.DB_NAME);
        return db;
    } catch (error) {
        console.log("❌ Error al conectar con MongoDB:", error);
    }
};
export default conectar;
