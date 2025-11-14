require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.URI;
const dbName = process.env.DB_NAME;

async function conectar() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ Conectado a MongoDB Atlas");
        const db = client.db(dbName);
        return { client, db }; // <-- retornamos ambos
    } catch (error) {
        console.error("❌ Error al conectar con MongoDB:", error);
        throw error;
    }
}

module.exports = conectar;
