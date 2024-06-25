import express from "express";
import initKnex from "knex";
import configuration from "../knexfile.js";
import fs from "fs";
import uniqid from "uniqid";

const knex = initKnex(configuration);
const router = express.Router();

// this is where the API endpoints will be built for the warehouses

// GET /warehouses/:id/inventories - getting all inventory items that belog to a warehouse
router.get("/:id/inventories", async (req, res) => {
  try {
    const warehouseInventory = await knex("inventories").where({
      warehouse_id: req.params.id,
    });
    //   .join("inventories", "inventories.warehouse.id", "warehouse.id")
    //   .where({ warehouse_id: req.params.id });

    res.json(warehouseInventory);
  } catch (error) {
    res.status(500).send(`Error retrieving warehouse inventory ${error}`);
  }
});

// //getting all posts that belog to a user
// const postsByUser = async (req, res) => {
//     try {
//         const posts = await knex('user')
//             .join("post", "post.user_id", "user.id") //combines the user with each post
//             .where({ user_id: req.params.id }); //only for users (&now posts that we're interested in)

//             //try commenting out the .where line & console.logging the posts var.
//             // see how mysql joins the entries

//         res.json(posts);
//     } catch (error) {
//         res.status(500).json({
//             message: `Unable to retrieve posts for user with ID ${req.params.id}: ${error}`,
//           });
//     }
// };

export default router;
