import "dotenv/config";
import express from "express";
import cors from "cors";
import warehouses from "./routes/warehouses.js";
import inventory from "./routes/inventory.js";

const app = express();
const PORT = process.env.PORT ?? 8080;

app.use(cors());
app.use(express.json());
// app.use(express.static("public")); // use if needed for static assets in public folder, don't think will be needed but here just in case

app.use("/api/warehouses", warehouses);
app.use("/api/warehouses/:id", warehouses);
app.use("/api/inventories", inventory);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
