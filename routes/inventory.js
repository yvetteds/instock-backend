import express from "express";
import fs from "fs";
import uniqid from "uniqid";
import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const router = express.Router();

// this is where the API endpoints will be built for the inventory

// Note: The warehouse name for each inventory item must also be included in the response.
router.get("/", async (_req, res) => {
  try {
    const data = await knex("inventories");
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving Inventories: ${err}`);
  }
});

export default router;

// Create an API on the back-end using Express and Express router to provide the front-end with a list of all Inventory items from all Warehouses.

// Data should be returned from your database using knex.

// GET /api/inventories

// Response returns 200 if successful

// Response body example:

// [
//     {
//         "id": 1,
//         "warehouse_name": "Manhattan",
//         "item_name": "Television",
//         "description": "This 50\", 4K LED TV provides a crystal-clear picture and vivid colors.",
//         "category": "Electronics",
//         "status": "In Stock",
//         "quantity": 500
//       },
//       {
//         "id": 2,
//         "warehouse_name": "Manhattan",
//         "item_name": "Gym Bag",
//         "description": "Made out of military-grade synthetic materials, this gym bag is highly durable, water resistant, and easy to clean.",
//         "category": "Gear",
//         "status": "Out of Stock",
//         "quantity": 0
//     },
//     ...
//   ]
