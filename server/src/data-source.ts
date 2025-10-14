import "reflect-metadata";
import { DataSource } from "typeorm";
import { DeskDAO } from "./models/DAO/DeskDAO";
import { ServiceDAO } from "./models/DAO/ServiceDAO";
import { TicketDAO } from "./models/DAO/TicketDAO";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true, // auto-create tables (disable in production)
  logging: true,
  entities: [DeskDAO, ServiceDAO, TicketDAO],
});
