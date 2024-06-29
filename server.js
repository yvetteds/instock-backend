import "dotenv/config";
import express from "express";
import cors from "cors";
import warehouses from "./routes/warehouses-route.js";
import inventory from "./routes/inventory-route.js";

const app = express();
let { PORT, CORS_ORIGIN } = process.env;

PORT = process.env.PORT ?? 8080;

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.use("/api/warehouses", warehouses);
app.use("/api/warehouses/:id", warehouses);
app.use("/api/inventories", inventory);
app.use("/api/inventories/:id", inventory);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
