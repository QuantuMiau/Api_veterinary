// controllers/employeeController.js
import * as Employee from "../models/employeeModel.js";
import { generateToken } from "../helpers/jwt.js";
import { parsePgError } from "../helpers/pgErrors.js";
import bcrypt from "bcryptjs";

/** POST /employee/login */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email y contraseña son requeridos" });

    const employee = await Employee.findByEmail(email);

    if (!employee)
      return res.status(401).json({ message: "Credenciales incorrectas" });

    if (!employee.status)
      return res.status(401).json({ message: "Empleado inactivo" });

    const validPassword = await bcrypt.compare(password, employee.password);
    if (!validPassword)
      return res.status(401).json({ message: "Credenciales incorrectas" });

    const token = generateToken({
      employeeId: employee.employee_id,
      role: employee.role,
    });

    const { password: _pw, ...employeeSafe } = employee;
    return res.status(200).json({ ok: true, employee: employeeSafe, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

/** POST /employee/register — solo Admin */
export const register = async (req, res) => {
  try {
    const { first_name, last_name, mother_name, email, phone, password, role } = req.body;

    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ message: "Faltan campos requeridos" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await Employee.register(first_name, last_name, mother_name, email, phone, hashedPassword, role);

    return res.status(201).json({ ok: true, message: "Empleado registrado exitosamente" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** PUT /employee/update */
export const updateEmployee = async (req, res) => {
  try {
    const { id: employeeId } = req.params;
    const { first_name, last_name, mother_name, email, phone, role } = req.body;

    await Employee.updateEmployee(employeeId, first_name, last_name, mother_name, email, phone, role);
    return res.status(200).json({ ok: true, message: "Empleado actualizado" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** PUT /employee/password */
export const updatePassword = async (req, res) => {
  try {
    const { id: employeeId } = req.params;
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ message: "La contraseña es requerida" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await Employee.updatePassword(employeeId, hashedPassword);
    return res.status(200).json({ ok: true, message: "Contraseña actualizada" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** DELETE /employee/:id — solo Admin */
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await Employee.deleteEmployee(id);
    return res.status(200).json({ ok: true, message: "Empleado desactivado" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

export const activeEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await Employee.activeEmployee(id);
    return res.status(200).json({ ok: true, message: "Empleado activado" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** GET /employee — lista todos */
export const getAll = async (req, res) => {
  try {
    const employees = await Employee.getAll();
    return res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener empleados" });
  }
};

/** GET /employee/:id */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.getById(id);

    if (!employee) return res.status(404).json({ message: "Empleado no encontrado" });

    return res.status(200).json(employee);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el empleado" });
  }
};
