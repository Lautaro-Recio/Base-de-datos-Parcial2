import express from "express";
import cors from "cors";
import { conectar } from "./conexion.js";

import rutasConductores from "./routes/conductores.js";
import rutasAutomoviles from "./routes/automoviles.js";
import rutasMultas from "./routes/multas.js";

const app = express();

app.use(cors());
app.use(express.json());

// Conexión a MongoDB
conectar();

// Rutas
app.use("/conductores", rutasConductores);
app.use("/automoviles", rutasAutomoviles);
app.use("/multas", rutasMultas);

const PORT = process.env.PORT || 4000;


app.listen(PORT, "127.0.0.1", () => {
    console.log(`🔥 Servidor en http://127.0.0.1:${PORT}`);
});
