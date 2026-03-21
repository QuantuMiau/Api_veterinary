// controllers/saleController.js
import * as Sale from "../models/saleModel.js";
import { parsePgError } from "../helpers/pgErrors.js";

/** POST /sale — registrar venta de clínica */
export const newSale = async (req, res) => {
  try {
    const { employeeId } = req.employee;
    const { clientId, paymentMethod, items } = req.body;

    if (!paymentMethod || !items || !items.length)
      return res.status(400).json({ message: "paymentMethod e items son requeridos" });

    if (paymentMethod === "Credito" && !clientId)
      return res.status(400).json({ message: "client_id es obligatorio para ventas a crédito" });

    await Sale.newSale(employeeId, clientId ?? null, paymentMethod, items);
    return res.status(201).json({ ok: true, message: "Venta registrada exitosamente" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** GET /sale — todas las ventas */
export const getAll = async (req, res) => {
  try {
    const sales = await Sale.getAll();
    return res.status(200).json(sales);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener ventas" });
  }
};

/** GET /sale/:id — detalle de venta */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await Sale.getById(id);

    if (!detail.length)
      return res.status(404).json({ message: "Venta no encontrada" });

    return res.status(200).json(detail);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener la venta" });
  }
};

/** GET /sale/employee/:employeeId — ventas por empleado */
export const getByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const sales = await Sale.getByEmployee(employeeId);
    return res.status(200).json(sales);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener ventas del empleado" });
  }
};
