import { AppDataSource } from "./data-source";
import express from "express";

AppDataSource.initialize().then(() => {
  const app = express();
  app.use(express.json());

  app.get("/", (_, res) => res.send("Server is running! 🚀"));

  app.listen(3000, () => console.log("Server started on http://localhost:3000"));
}).catch(error => console.error(error));
