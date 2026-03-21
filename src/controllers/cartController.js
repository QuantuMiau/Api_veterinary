// controllers/cartController.js
import * as Cart from "../models/cartModel.js";
import { parsePgError } from "../helpers/pgErrors.js";

/** GET /cart — ver carrito del usuario */
export const getCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const items = await Cart.viewCart(userId);
    return res.status(200).json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el carrito" });
  }
};

/** POST /cart — agregar producto al carrito */
export const addCart = async (req, res) => {
  try {
    const { cartId } = req.user;
    const { conceptId, quantity } = req.body;

    if (!conceptId || !quantity)
      return res.status(400).json({ message: "conceptId y quantity son requeridos" });

    await Cart.addToCart(cartId, conceptId, quantity);
    return res.status(201).json({ ok: true, message: "Producto agregado al carrito" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** PUT /cart — actualizar cantidad */
export const updateQuantity = async (req, res) => {
  try {
    const { cartId } = req.user;
    const { conceptId, quantity } = req.body;

    if (!conceptId || quantity === undefined)
      return res.status(400).json({ message: "conceptId y quantity son requeridos" });

    await Cart.updateQuantity(cartId, conceptId, quantity);
    return res.status(200).json({ ok: true, message: "Cantidad actualizada" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** DELETE /cart — eliminar producto del carrito */
export const removeFromCart = async (req, res) => {
  try {
    const { cartId } = req.user;
    const { conceptId } = req.body;

    if (!conceptId)
      return res.status(400).json({ message: "conceptId es requerido" });

    await Cart.removeFromCart(cartId, conceptId);
    return res.status(200).json({ ok: true, message: "Producto eliminado del carrito" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};
