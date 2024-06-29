import express from "express";
import fs from "fs";
import uniqid from "uniqid";
import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const router = express.Router(); // routing

// this is where the API endpoints will be built for the inventory

// Note: The warehouse name for each inventory item must also be included in the response.

/* -------------------------------------------------------------------------- */
/*                             GET INVENTORY ITEMS                            */
/* -------------------------------------------------------------------------- */

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
        "quantity",
        "warehouse_id"
      );
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send(`Error retrieving inventories: ${err}`);
  }
});

/* -------------------------------------------------------------------------- */
/*                             GET SINGLE INVENTORY ITEM                      */
/* -------------------------------------------------------------------------- */

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const inventories = await knex("inventories")
      .join("warehouses", "inventories.warehouse_id", "warehouses.id")
      .select(
        "inventories.id",
        "warehouse_name",
        "item_name",
        "description",
        "category",
        "status",
        "quantity"
      )
      .where("inventories.id", id)
      .first();

    if (!inventories)
      res.status(404).send(`The #ID: ${id} you provided is invalid.`);

    res.json(inventories);
  } catch (error) {
    return res
      .status(500)
      .json(
        `Unable to retrieve inventories. Please try again. ["ERROR_MESSAGE"]: ${error}`
      );
  }
});

/* -------------------------------------------------------------------------- */
/*                             DELETE INVENTORY ITEM                          */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                             EDIT INVENTORY ITEM                            */
/* -------------------------------------------------------------------------- */

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const inventoryData = req.body;

  // Validation steps
  if (
    !inventoryData.category ||
    !inventoryData.description ||
    !inventoryData.id ||
    !inventoryData.item_name ||
    inventoryData.quantity === undefined ||
    !inventoryData.status ||
    !inventoryData.warehouse_id ||
    !inventoryData.warehouse_name
  ) {
    return res.status(400).json({
      message:
        "Request contains missing properties. All inventory item properties are required.",
    });
  }

  if (isNaN(Number(inventoryData.quantity))) {
    return res
      .status(400)
      .json({ message: "Quantity must be a valid number." });
  }

  try {
    const item = await knex("inventories").where({ id }).first();
    if (!item) {
      return res.status(404).json({ message: "Inventory ID not found" });
    }

    const warehouse = await knex("warehouses")
      .where({ id: inventoryData.warehouse_id })
      .first();

    if (warehouse) {
      const {
        item_name,
        category,
        description,
        status,
        quantity,
        warehouse_id,
      } = inventoryData;
      await knex("inventories").where({ id }).update({
        item_name,
        category,
        description,
        status,
        quantity,
        warehouse_id,
      });
    } else {
      return res.status(404).json({ message: "Warehouse ID not found" });
    }

    const updatedItem = await knex("inventories").where({ id }).first();
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Error updating warehouse", error });
  }
});

/* -------------------------------------------------------------------------- */
/*                             ADD INVENTORY ITEM                            */
/* -------------------------------------------------------------------------- */

router.post("/", async (req, res) => {
  const inventoryData = req.body;

  // Validation steps
  if (
    !inventoryData.category ||
    !inventoryData.description ||
    !inventoryData.id ||
    !inventoryData.item_name ||
    inventoryData.quantity === undefined ||
    !inventoryData.status ||
    !inventoryData.warehouse_id ||
    !inventoryData.warehouse_name
  ) {
    return res
      .status(400)
      .json({
        message:
          "Request contains missing properties. All inventory item properties are required.",
      });
  }

  if (isNaN(Number(inventoryData.quantity))) {
    return res
      .status(400)
      .json({ message: "Quantity must be a valid number." });
  }

  try {
    const warehouse = await knex("warehouses")
      .where({ id: inventoryData.warehouse_id })
      .first();

    if (warehouse) {
      const {
        id,
        item_name,
        category,
        description,
        status,
        quantity,
        warehouse_id,
      } = inventoryData;

      await knex("inventories").insert({
        item_name,
        category,
        description,
        status,
        quantity,
        warehouse_id,
      });

      const newItem = await knex("inventories").where({ id }).first();
      res.status(201).json(newItem);
    } else {
      return res.status(404).json({ message: "Warehouse ID not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating new inventory item", error });
  }
});

export default router;
