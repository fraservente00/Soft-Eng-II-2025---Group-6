import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { AppDataSource } from "./data-source";
//import routes from "./routes"; // <-- usa SOLO questo
import deskRoutes from "./routes/deskRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import routes from "./routes";
import cors from "cors";
import morgan from "morgan";


const PORT = Number(process.env.PORT ?? 3000);
export const app = express();
async function main() {
  await AppDataSource.initialize();
  console.log("[DB] DataSource initialized");



  // Middlewares
  app.use(express.json());
  app.use(cors({origin: "http://localhost:5173", credentials: true}));
  app.use(morgan("dev"));

  // Health & root
  app.get("/healthz", (_req: Request, res: Response) => res.json({ ok: true }));
  app.get("/", (_req: Request, res: Response) => res.send("Server is running! 🚀"));

  // API (usa il router aggregato: /desks, /services, /tickets)
  app.use("/api", routes);
  //app.use("/api/desks", deskRoutes);
  //app.use("/api/services", serviceRoutes);
  //app.use("/api/tickets", ticketRoutes);

  // 404 per API non trovate
  //app.use("/api", (_req, res) => res.status(404).json({ error: "Not Found" }));

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[ERROR]", err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error("[FATAL]", error);
  process.exit(1);
});
