import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthAdapter } from "../adapters/auth.adapter";

const authAdapter = new AuthAdapter();
const JWT_SECRET = process.env.JWT_SECRET_KEY || "default_secret";

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authAdapter.registerUser(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      message: "Error interno en la comunicación con el Core",
      details: error.response?.data || error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Validamos contra el Core (Python) a través del adaptador
    const userData = await authAdapter.validateCredentials({ email, password });

    // 2. Firmamos el token con el ID del usuario (sub)
    const token = jwt.sign(
      {
        sub: userData.id,
        email: userData.email,
        role: "analyst",
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    // 3. Respuesta estructurada para el frontend
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Solo HTTPS en producción
      sameSite: "lax", // Permite envío cruzado entre puertos (Frontend -> BFF)
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
    });

    res.status(200).json({
      message: "Autenticación exitosa",
      user: {
        email: userData.email,
        full_name: userData.full_name,
      },
    });
  } catch (error: any) {
    res.status(401).json({
      error: "Fallo de autenticación",
      details: error.message,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Sesión cerrada correctamente" });
};
