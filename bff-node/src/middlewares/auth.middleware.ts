import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "default_secret";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Obtenemos el token directamente desde las cookies extraídas por cookie-parser
    const token = req.cookies.access_token;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Acceso denegado. No se encontró el token de sesión." });
    }

    // 2. Verificamos la firma y la vigencia del token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // 3. Inyectamos la información en la Request para los siguientes controladores
    (req as any).user = {
      id: decoded.sub, // Usamos 'sub' como ID, alineado con tu auth.controller.ts
      email: decoded.email,
      role: decoded.role,
    };

    next(); // Permite que la petición continúe hacia el controlador
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Token inválido o expirado. Inicie sesión nuevamente." });
  }
};
