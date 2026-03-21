// controllers/orderController.js
import * as Order from "../models/orderModel.js";
import { parsePgError } from "../helpers/pgErrors.js";

/** POST /order — crear orden desde carrito */
export const newOrder = async (req, res) => {
  try {
    const { userId } = req.user;
    const { paymentMethod } = req.body;

    if (!paymentMethod)
      return res.status(400).json({ message: "paymentMethod es requerido" });

    await Order.newOrder(userId, paymentMethod);
    return res.status(201).json({ ok: true, message: "Orden creada exitosamente" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** GET /order — órdenes del usuario autenticado */
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const orders = await Order.getByUser(userId);
    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener órdenes" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.getAllOrders();
    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener órdenes" });
  }
};

/** GET /order/:id — detalle de una orden */
export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const details = await Order.getDetails(id);

    if (!details.length)
      return res.status(404).json({ message: "Orden no encontrada" });

    return res.status(200).json(details);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el detalle de la orden" });
  }
};

/** PATCH /order/:id/status — actualizar estado (empleados) */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ["Cancelado", "En Progreso", "Listo", "Entregado"];
    if (!orderStatus || !validStatuses.includes(orderStatus))
      return res.status(400).json({ message: `Estado inválido. Valores permitidos: ${validStatuses.join(", ")}` });

    await Order.updateOrderStatus(id, orderStatus);
    return res.status(200).json({ ok: true, message: "Estado de la orden actualizado" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};
