import express from "express";

const router = express.Router();

// Credenciales de autenticación
const USUARIO_VALIDO = "alumno";
const CONTRASENA_VALIDA = "alu123";

// Ruta de login
router.post("/login", (req, res) => {
    const { username, password } = req.body;

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
    return res.status(200).json({
        success: true,
        message: "Sesión cerrada correctamente"
    });
});

export default router;
