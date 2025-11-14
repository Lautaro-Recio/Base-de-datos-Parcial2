// app.js (script de prueba)
require('dotenv').config();
const conectar = require("./conexion.js");

const mostrar = async () => {
    try {
        const { client, db } = await conectar();
        console.log("db obtenida:", db ? "ok" : "undefined");
        const col = db.collection("test");
        const docs = await col.find().toArray();
        console.log("Documentos en test:", docs);
        // cerramos la conexión del cliente al terminar el script
        await client.close();
    } catch (err) {
        console.error("Error en mostrar():", err.message || err);
    }
};

mostrar();