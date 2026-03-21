// middleware/authEmployee.js — Middleware para empleados (Admin / Empleado)
import jwt from "jsonwebtoken";

/**
 * Verifica que la petición viene de un empleado autenticado.
 * El token debe contener { employeeId, role }.
 */
export const authEmployee = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) return res.status(401).json({ message: "Token requerido" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.employee = decoded; // { employeeId, role }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};

/**
 * Middleware adicional para rutas exclusivas de Admin.
 * Debe usarse DESPUÉS de authEmployee.
 */
export const onlyAdmin = (req, res, next) => {
  if (req.employee?.role !== "Admin") {
    return res.status(403).json({ message: "Acceso restringido a administradores" });
  }
  next();
};
