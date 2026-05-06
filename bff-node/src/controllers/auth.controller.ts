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
   message: 'Error interno en la comunicación con el Core',
   details: error.response?.data || error.message 
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
   { expiresIn: "8h" }
  );

  // 3. Respuesta estructurada para el frontend
  res.json({
   access_token: token,
   token_type: "bearer",
   user: {
    id: userData.id,
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