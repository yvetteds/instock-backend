import express from "express";
import initKnex from "knex";
import configuration from "../knexfile.js";
import fs from "fs";
import uniqid from "uniqid";

const knex = initKnex(configuration);
const router = express.Router();

// this is where the API endpoints will be built for the warehouses

// GET /api/warehouses/:id/inventories - getting all inventory items that belog to a warehouse
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

    res.json(warehouseInventory);
  } catch (error) {
    res.status(500).send(`Error retrieving warehouse inventory ${error}`);
  }
});

// POST /api/warehouses - post a new warehouse
router.post("/", async (req, res) => {
  const {
    warehouse_name,
    address,
    city,
    country,
    contact_name,
    contact_position,
    contact_phone,
    contact_email,
  } = req.body;

  if (
    !warehouse_name ||
    !address ||
    !city ||
    !country ||
    !contact_name ||
    !contact_position ||
    !contact_phone ||
    !contact_email
  ) {
    return res.status(400).json({
      message: "Missing one or more input fields",
    });
  }

  try {
    const result = await knex("warehouses").insert({
      warehouse_name: warehouse_name.toUpperCase(),
      address,
      city: city.toUpperCase(),
      country,
      contact_name: contact_name.toUpperCase(),
      contact_position: contact_position.toUpperCase(),
      contact_phone,
      contact_email,
    });

    const newWarehouse = { ...result, id: uniqid() };

    res.json(newWarehouse);
  } catch (error) {
    res.status(500).send(`Error posting warehouse ${error}`);
  }
});

export default router;
