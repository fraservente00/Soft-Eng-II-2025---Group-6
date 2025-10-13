import "reflect-metadata";
import { DataSource } from "typeorm";
import { DeskDAO } from "../models/DAO/DeskDAO";
import { ServiceDAO } from "../models/DAO/ServiceDAO";
import { TicketDAO } from "../models/DAO/TicketDAO";

export const TestDataSource = new DataSource({
    type: "sqlite",
    database: ":memory:", // Database solo in RAM
    dropSchema: true,      // Cancella lo schema a ogni inizializzazione
    synchronize: true,     // Crea automaticamente le tabelle
    logging: false,
    entities: [DeskDAO, ServiceDAO, TicketDAO],
});
