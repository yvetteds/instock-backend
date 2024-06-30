import "dotenv/config";
// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
};
