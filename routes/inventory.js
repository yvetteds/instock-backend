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
    res.status(500).send(`Error retrieving Inventories: ${err}`);
  }
});

export default router;
