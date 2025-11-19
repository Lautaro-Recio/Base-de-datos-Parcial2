import express from "express"; // Trae Express, el framework que te permite crear un servidor web fácilmente.
import cors from "cors"; // Trae Cors, que te permite o deniega peticiones de otros servidores.
import dotenv from "dotenv"; // Trae dotenv, que te permite cargar variables de entorno desde un archivo .env.
import { conectar } from "./conexion.js"; // Trae la función conectar, que se encarga de conectarte a MongoDB.

import rutasAuth from "./routes/auth.js"; // Importa las rutas de autenticación.
import rutasConductores from "./routes/conductores.js"; // Importa las rutas de conductores.
import rutasAutomoviles from "./routes/automoviles.js"; // Importa las rutas de automóviles.
import rutasMultas from "./routes/multas.js"; // Importa las rutas de multas.

dotenv.config(); // Carga automáticamente todas las variables del archivo .env en process.env.

const app = express(); // Crea una instancia de Express.

app.use(cors()); // Permite peticiones de otros servidores.
app.use(express.json()); // Permite que Express entienda peticiones JSON.

// Conexión a MongoDB
conectar(); 

// Rutas
app.use("/auth", rutasAuth); // Rutas de autenticacion
app.use("/conductores", rutasConductores); // Rutas de conductores
app.use("/automoviles", rutasAutomoviles); // Rutas de automoviles
app.use("/multas", rutasMultas); // Rutas de multas

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000; // Puerto por defecto

app.listen(PORT, "127.0.0.1", () => {
    console.log(`🔥 Servidor backend corriendo en http://127.0.0.1:${PORT}`);
});