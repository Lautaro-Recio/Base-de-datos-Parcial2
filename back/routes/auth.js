import express from "express"; // Importa express, que es el framework que te permite crear un servidor web fácilmente.

const router = express.Router(); // Crea un router de Express.

// Credenciales de autenticación
const USUARIO_VALIDO = "alumno"; // Usuario
const CONTRASENA_VALIDA = "alu123";  // Contraseña

// Ruta de login
router.post("/login", (req, res) => {
    const { username, password } = req.body; // Obtiene el usuario y la contraseña del body de la petición

    // Validar que se envíen los datos
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Usuario y contraseña son requeridos"
        });
    }

    // Validar credenciales
    if (username === USUARIO_VALIDO && password === CONTRASENA_VALIDA) {
        return res.status(200).json({
            success: true,
            message: "Autenticación exitosa",
            token: "auth_token_" + Date.now() // Token simple para la sesión
        });
    } else {
        return res.status(401).json({
            success: false,
            message: "Usuario o contraseña incorrectos"
        });
    }
});

// Ruta de logout
router.post("/logout", (req, res) => {
    return res.status(200).json({ // retorna un json con el estado de la operacion
        success: true,
        message: "Sesión cerrada correctamente"
    });
});

export default router;
