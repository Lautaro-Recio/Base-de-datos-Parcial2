const conectar = require("./conexion");

async function mostrar (){
    const db = await conectar();
    try{
        const coleccion = db.collection("usuarios");
        const usuarios = await coleccion.find().toArray();
        console.log(usuarios);
    }catch(error){
        console.log(error);
    }
}

mostrar()