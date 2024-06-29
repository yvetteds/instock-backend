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

    res.json(warehouses);
  } catch (error) {
    return res
      .status(500)
      .json(
        `Unable to retrieve warehouses. Please try again. ["ERROR_MESSAGE"]: ${error}`
      );
  }
});

/* -------------------------------------------------------------------------- */
/*                           GET SINGLE WAREHOUSE                             */
/* -------------------------------------------------------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const warehouses = await knex("warehouses").where({ id }).first();

    if (!warehouses)
      res.status(404).send(`The #ID: ${id} you provided is invalid.`);

    res.json(warehouses);
  } catch (error) {
    return res
      .status(500)
      .json(
        `Unable to retrieve warehouses. Please try again. ["ERROR_MESSAGE"]: ${error}`
      );
  }
});

/* -------------------------------------------------------------------------- */
/*                             DELETE A WAREHOUSE                             */
/* -------------------------------------------------------------------------- */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const warehouse = await knex("warehouses").where({ id }).first();
    if (!warehouse)
      return res
        .status(404)
        .message(`The warehouse #ID: ${id}, you provided is invalid.`);

    // Delete the inventory item associated to warehouse_name
    await knex("inventories").where("warehouse_id", id).del();

    // Delete the warehouse
    await knex("warehouses").where({ id }).del();

    res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .json(
        `Unable to delete the selected warehouse item with #ID ${id}. Please try again. ["ERROR_MESSAGE"]: ${error}`
      );
  }
});

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
        message: `Inventory for warehouse with ID: ${req.params.id} not found`,
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

  // validating phone and email

  function validateEmail(email) {
    const emailRegex =
      /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return emailRegex.test(email);
  }

  function validatePhone(phone) {
    const phoneRegex = /^\+([0-9]{1})\s\(([0-9]{3})\)\s([0-9]{3})\-([0-9]{4})$/;
    return phoneRegex.test(phone);
  }

  if (!validateEmail(contact_email)) {
    return res.status(400).json({
      message: "Invalid email input",
    });
  } else if (contact_phone.length < 11) {
    return res.status(400).json({
      message: "Invalid phone input",
    });
  }

  try {
    const result = await knex("warehouses").insert({
      warehouse_name:
        warehouse_name.charAt(0).toUpperCase() + warehouse_name.slice(1),
      address,
      city: city.charAt(0).toUpperCase() + city.slice(1),
      country,
      contact_name: contact_name
        .split(" ")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" "),
      contact_position: contact_position
        .split(" ")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" "),
      contact_phone: contact_phone
        .replace(/\D/g, "")
        .replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "+$1 ($2) $3-$4"),
      contact_email,
    });

    const newWarehouseId = result[0];

    const newWarehouse = await knex("warehouses")
      .where({ id: newWarehouseId })
      .first();

    res.json(newWarehouse);
  } catch (error) {
    res.status(500).send(`Error posting warehouse ${error}`);
  }
});

/* -------------------------------------------------------------------------- */
/*                             EDIT A WAREHOUSE                             */
/* -------------------------------------------------------------------------- */

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const warehouseData = req.body;

  // Validation steps
  if (
    !warehouseData.id ||
    !warehouseData.warehouse_name ||
    !warehouseData.address ||
    !warehouseData.city ||
    !warehouseData.country ||
    !warehouseData.contact_name ||
    !warehouseData.contact_position ||
    !warehouseData.contact_phone ||
    !warehouseData.contact_email
  ) {
    return res.status(400).json({
      message:
        "Request contains missing properties. All warehouse details are required.",
    });
  }

  // validating phone and email

  function validateEmail(email) {
    const emailRegex =
      /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return emailRegex.test(warehouseData.contact_email);
  }

  function validatePhone(phone) {
    const phoneRegex = /^\+([0-9]{1})\s\(([0-9]{3})\)\s([0-9]{3})\-([0-9]{4})$/;
    return phoneRegex.test(warehouseData.contact_phone);
  }

  if (!validateEmail(warehouseData.contact_email)) {
    return res.status(400).json({
      message: "Invalid email input",
    });
  } else if (contact_phone.length < 11) {
    return res.status(400).json({
      message: "Invalid phone input",
    });
  }

  const warehouse = await knex("warehouses").where({ id }).first();

  try {
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse ID not found" });
    } else {
      const {
        id,
        warehouse_name,
        address,
        city,
        country,
        contact_name,
        contact_position,
        contact_phone,
        contact_email,
      } = warehouseData;
      await knex("warehouses")
        .where({ id })
        .update({
          id,
          warehouse_name,
          address,
          city,
          country,
          contact_name,
          contact_position,
          contact_phone: contact_phone
            .replace(/\D/g, "")
            .replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "+$1 ($2) $3-$4"),
          contact_email,
        });

      const updatedWarehouse = await knex("warehouses").where({ id }).first();
      res.status(200).json(updatedWarehouse);
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating warehouse", error });
  }
});

export default router;
