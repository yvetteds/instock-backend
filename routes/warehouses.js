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
router.get("/", async (req, res) => {
  try {
    const warehouses = await knex("inventories");

    if (!warehouses) return [];

    res.json(warehouses)
  } catch (error) {
    return res.status(500).json("We're unable to your fetch request. Please try again.")
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
        message: `Warehouse with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json(warehouseInventory);
  } catch (error) {
    res.status(500).send(`Error retrieving warehouse inventory ${error}`);
  }
});

export default router;
