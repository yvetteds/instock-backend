import express from "express";
import initKnex from "knex";
import configuration from "../knexfile.js";
import fs from "fs";
import uniqid from "uniqid";

const knex = initKnex(configuration);
const router = express.Router();

// this is where the API endpoints will be built for the warehouses
/* -------------------------------------------------------------------------- */
/*                             GET ALL WAREHOUSES                             */
/* -------------------------------------------------------------------------- */
router.get("/", async (_req, res) => {
  try {
    const warehouses = await knex("warehouses");

    if (!warehouses) return [];

    res.json(warehouses)
  } catch (error) {
    return res.status(500).json(`Unable to retrieve warehouses. Please try again. ["ERROR_MESSAGE"]: ${error}`)
  }
});

/* -------------------------------------------------------------------------- */
/*                             DELETE A WAREHOUSE                             */
/* -------------------------------------------------------------------------- */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const warehouse = await knex("warehouses").where({ id }).first();
    if (!warehouse) return res.status(404).message(`The warehouse #ID: ${id}, you provided is invalid.`);

    // Delete the inventory item associated to warehouse_name
    await knex("inventories").where("warehouse_id", id).del();

    // Delete the warehouse
    await knex("warehouses").where({ id }).del();

    res.status(204).send();
  } catch (error) {
    return res.status(500).json(`Unable to delete the selected warehouse item with #ID ${id}. Please try again. ["ERROR_MESSAGE"]: ${error}`)
  }
})


// GET /warehouses/:id/inventories - getting all inventory items that belog to a warehouse
router.get("/:id/inventories", async (req, res) => {
  try {
    const warehouseInventory = await knex("inventories")
      .where({
        warehouse_id: req.params.id,
      })
      .select("id", "item_name", "category", "status", "quantity");

    if (!warehouseInventory.length) {
      return res.status(404).json({
        message: `Inventory for warehouse with ID: ${req.params.id} not found`,
      });
    }

    res.status(200).json(warehouseInventory);
  } catch (error) {
    res.status(500).send(`Error retrieving warehouse inventory ${error}`);
  }
});

export default router;
