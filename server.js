require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const ruta = require("./routes/routes");
const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.send("Hola mundo");
});

app.use((err,re,res,next)=>{
    console.log(err.stack); res.status(500).json({error:"Algo salio mal"})
    res.status(500).json({error: err.message});
})

mongoose.connect(process.env.URI, { useUnifiedTopology: true})
    .then(() => console.log("Conectado a la base de datos"))
    .catch((error) => console.log(error));

app.use("/api", ruta);

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});

app.use("/api", ruta);


