// controllers/userController.js
import * as User from "../models/userModel.js";
import { generateToken } from "../helpers/jwt.js";
import { parsePgError } from "../helpers/pgErrors.js";
import bcrypt from "bcryptjs";

/** POST /user/login */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email y contraseña son requeridos" });

    // findByEmail consulta "Users" directamente para obtener el hash
    const user = await User.findByEmail(email);

    if (!user)
      return res.status(401).json({ message: "Email o contraseña incorrectos" });

    if (!user.status)
      return res.status(401).json({ message: "Usuario inactivo" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Email o contraseña incorrectos" });

    // Obtiene cart_id por separado (fn_login_user no sirve con bcrypt)
    const cartId = await User.getCartId(user.user_id);
    const token = generateToken({ userId: user.user_id, cartId });

    // Nunca devolver el hash de la contraseña
    const { password: _pw, ...userSafe } = user;
    return res.json({ ok: true, user: userSafe, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el login" });
  }
};

/** POST /user/register */
export const register = async (req, res) => {
  try {
    const { first_name, last_name, mother_name, email, phone, password } = req.body;

    if (!first_name || !last_name || !email || !phone || !password)
      return res.status(400).json({ message: "Faltan campos requeridos" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.register(first_name, last_name, mother_name, email, phone, hashedPassword);

    return res.status(201).json({ ok: true, message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** PUT /user/update — requiere auth */
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const { first_name, last_name, mother_name, email, phone } = req.body;

    await User.updateUser(userId, first_name, last_name, mother_name, email, phone);
    return res.status(200).json({ ok: true, message: "Usuario actualizado" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** PUT /user/password — requiere auth */
export const updatePassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ message: "La contraseña es requerida" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updatePassword(userId, hashedPassword);
    return res.status(200).json({ ok: true, message: "Contraseña actualizada" });
  } catch (error) {
    console.error(error);
    const { status, message } = parsePgError(error);
    return res.status(status).json({ message });
  }
};

/** GET /user — requiere auth */
export const getUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.getUserById(userId);

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener los datos del usuario" });
  }
};
