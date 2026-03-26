import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { swaggerDocs } from "./config/swagger.js";

import userRoutes from "./routes/userRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import supplyRoutes from "./routes/supplyRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import creditRoutes from "./routes/creditRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import clinicalRecordRoutes from "./routes/clinicalRecordRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import connectMongoDB from "./config/db-mongo.js";

dotenv.config();

// mongo
connectMongoDB();

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

// app mobile 
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/payment", paymentRoutes);

// catalogos 
app.use("/product", productRoutes);
app.use("/service", serviceRoutes);
app.use("/supply", supplyRoutes);

// panel admin 
app.use("/employee", employeeRoutes);
app.use("/client", clientRoutes);
app.use("/patient", patientRoutes);
app.use("/sale", saleRoutes);
app.use("/credit", creditRoutes);
app.use("/appointment", appointmentRoutes);
app.use("/clinical-record", clinicalRecordRoutes);
app.use("/dashboard", dashboardRoutes);


// swagger 
swaggerDocs(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
