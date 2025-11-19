require("dotenv").config(); // Carga las variables de entorno desde el archivo .env
const cors = require("cors"); // Permite peticiones de otros servidores
const express = require("express"); // Crea un servidor web fácilmente
const mongoose = require("mongoose"); // Conecta a MongoDB
const ruta = require("./back/routes/routes"); // Importa las rutas
const port = process.env.PORT || 3000;
const app = express();

app.use(cors()); // Permite peticiones de otros servidores
app.use(express.json()); // Permite que Express entienda peticiones JSON
app.use(express.urlencoded({extended: true})); // Permite que Express entienda peticiones URL

app.get("/", (req, res) => {
    res.send("Hola mundo");
});

app.use((err,re,res,next)=>{
    console.log(err.stack); res.status(500).json({error:"Algo salio mal"})
    res.status(500).json({error: err.message});
})

mongoose.connect(process.env.URI, { useUnifiedTopology: true}) // Conecta a MongoDB, useUnifiedTopology es una opción antigua de Mongoose que se usaba para activar el nuevo motor de monitoreo (Topology Engine) de MongoDB a partir de MongoDB Driver 3.2.
    .then(() => console.log("Conectado a la base de datos"))
    .catch((error) => console.log(error));

app.use("/api", ruta); // Utiliza las rutas importadas

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`); // Muestra el puerto en el que se está ejecutando el servidor
});

app.use("/api", ruta);
