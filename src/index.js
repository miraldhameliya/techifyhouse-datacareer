import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import { sequelize } from "./config/db/mysql.js";
import './models/associations.js';
import './models/index.js';
import { router } from "./routes/index.js";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });


const app = express();

const PORT = process.env.PORT ?? 30200;

console.log('call--PORT',process.env.PORT);

app.use(express.json());
app.use(cors({
  // origin: 'http://192.168.1.101:3000',
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.urlencoded({ extended: true }));


app.use("/api", router);

app.use((err, req, res, next) => {
  res.status(500).json({ message: "Something went wrong!" });
});
sequelize.sync().then(() => {
  console.log("✅ Database connected successfully");
  
  app.listen(PORT, () => {
    console.log(`🔥 Server running on port ${PORT}`);
  });
});

