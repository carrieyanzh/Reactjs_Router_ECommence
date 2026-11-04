import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv"; 

dotenv.config(); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

let dbOptions = {};

// Smart Detection: If a cloud Auth Token exists, connect to Turso Cloud
if (process.env.TURSO_AUTH_TOKEN) {
  console.log("☁️  SERVER IS CONNECTING TO TURSO CLOUD ROUTER");
  dbOptions = {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  };
} else {
  // If no token exists, fall back to your local SQLite file
  const localDatabasePath = path.resolve(__dirname, "database", "brightcart.db");
  console.log("💻 SERVER IS LOADING LOCAL SQLITE FILE:", localDatabasePath);
  dbOptions = {
    url: `file:${localDatabasePath}`,
  };
}

const db = createClient(dbOptions);

export default db;