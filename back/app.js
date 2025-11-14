require('dotenv').config();
const conectar = require("./conexion.js");

const mostrar = async () => {
    try {
        const { client, db } = await conectar();
        console.log("db obtenida:", db ? "ok" : "undefined");
        const col = db.collection("test");
        const docs = await col.find().toArray();
        console.log("Documentos en test:", docs);
        await client.close();
    } catch (err) {
        console.error("Error en mostrar():", err.message || err);
    }
};

mostrar();