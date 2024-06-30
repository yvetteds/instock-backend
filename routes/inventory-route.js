import express from "express";
import * as inventoryControllers from "../controllers/inventory-controller.js";

const router = express.Router();

router
  .route("/")
  .get(inventoryControllers.inventoryItems)
  .post(inventoryControllers.addInventoryItem);

router
  .route("/:id")
  .get(inventoryControllers.singleInventoryItem)
  .delete(inventoryControllers.deleteInventoryItem)
  .put(inventoryControllers.editInventoryItem);

export default router;
