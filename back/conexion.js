import { MongoClient } from 'mongodb';
const uri = 'mongodb+srv://audagnafacundo_db_user:9qvVONNrR6cB2QX7@cluster0.c59akek.mongodb.net/';
const dbName = 'parcial2_db';

async function conectar() {
    try {
        console.log('Conexión exitosa a la base de datos');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db(dbName);
        return db;
    } catch (error) {
        console.log(error);
    }

}
export default conectar;
