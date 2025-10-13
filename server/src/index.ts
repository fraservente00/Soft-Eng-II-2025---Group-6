import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import routes from "./routes";

// Routers
import deskController from "./controllers/deskController";
import serviceController from "./controllers/serviceController";
import ticketController from "./controllers/ticketController";

const PORT = Number(process.env.PORT ?? 3000);

async function main() {
  await AppDataSource.initialize();
  console.log("[DB] DataSource initialized");

  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use("/api", routes)

  // Health & root
  app.get("/healthz", (_req: Request, res: Response) => res.json({ ok: true }));
  app.get("/", (_req: Request, res: Response) => res.send("Server is running! 🚀"));

  // API routes
  app.use("/api/desks", deskController);
  app.use("/api/services", serviceController);
  app.use("/api/tickets", ticketController);

  // 404 for API not found
  app.use("/api", (_req, res) => res.status(404).json({ error: "Not Found" }));

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[ERROR]", err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  const server = app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });

  app.listen(3000, () => console.log("Server started on http://localhost:3000"));
}
main().catch(error => console.error(error));
