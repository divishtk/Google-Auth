import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.utils.js";
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

dotenv.config();
app.get("/", (req, res) => {
  res.send("Hello World!");
});

connectDB()

app.listen(process.env.PORT || 4000, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
