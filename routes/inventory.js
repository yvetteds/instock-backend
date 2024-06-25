import express from "express";
import fs from "fs";
import uniqid from "uniqid";
import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const router = express.Router(); // routing

// this is where the API endpoints will be built for the inventory

// Note: The warehouse name for each inventory item must also be included in the response.
router.get("/", async (_req, res) => {
  try {
    const data = await knex("inventories")
      .join("warehouses", "inventories.warehouse_id", "warehouses.id")
      .select(
        "inventories.id",
        "warehouse_name",
        "item_name",
        "description",
        "category",
        "status",
        "quantity"
      );
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send(`Error retrieving inventories: ${err}`);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const rowsDeleted = await knex("inventories")
      .where({ id: req.params.id })
      .delete();

    if (rowsDeleted === 0) {
      return res
        .status(404)
        .json({ message: `Inventory item with ID ${req.params.id} not found` });
    }

    // No Content response
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      message: `Unable to delete inventory item ${req.params.id}: ${error}`,
    });
  }
});

export default router;
