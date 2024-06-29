import express from "express";
import * as warehouseControllers from "../controllers/warehouse-controller.js";

const router = express.Router();

router
  .route("/")
  .get(warehouseControllers.warehouses)
  .post(warehouseControllers.addWarhouse);

router
  .route("/:id")
  .get(warehouseControllers.singleWarehouse)
  .delete(warehouseControllers.deleteWarehouse)
  .put(warehouseControllers.editWarehouse);

router
  .route("/:id/inventories")
  .get(warehouseControllers.singleWarehouseDetails);

export default router;
