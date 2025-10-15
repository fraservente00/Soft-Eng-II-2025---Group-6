import request from "supertest";
import express from "express";
import ticketRoutes from "../../routes/ticketRoutes";
import { AppDataSource } from "../../data-source";
import { TicketDAO } from "../../models/DAO/TicketDAO";
import { ServiceDAO } from "../../models/DAO/ServiceDAO";
import { DeskDAO } from "../../models/DAO/DeskDAO";
import { StatusType } from "../../models/StatusType";

const app = express();
app.use(express.json());
app.use("/api/tickets", ticketRoutes);

describe("Ticket Routes Integration Tests", () => {
  let service: ServiceDAO;
  let desk: DeskDAO;

  beforeAll(async () => {
  await AppDataSource.initialize();
  const serviceRepo = AppDataSource.getRepository(ServiceDAO);
  const deskRepo = AppDataSource.getRepository(DeskDAO);

  service = await serviceRepo.save({
    name: `Test Service ${Date.now()}`,
    estimatedTime: 15
  });

  desk = await deskRepo.save({ name: `Test Desk ${Date.now()}` });
  });



  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe("GET /api/tickets", () => {
    it("should return all tickets", async () => {
      const ticketRepo = AppDataSource.getRepository(TicketDAO);
      await ticketRepo.save([{ service, managedBy: desk, status: StatusType.open, TimeStarted: new Date() }]);

      const res = await request(app).get("/api/tickets");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("POST /api/tickets", () => {
    it("should create a new ticket", async () => {
      const newTicket = {
        service: { id: service.id },
        managedBy: { id: desk.id },
        status: StatusType.open,
        createdAt: new Date(),
        };


      const res = await request(app)
        .post("/api/tickets")
        .send(newTicket)
        .set("Accept", "application/json");

      expect(res.status).toBe(201);
      expect(res.body.service.id).toBe(service.id);
    });
  });

  describe("GET /api/tickets/:id", () => {
    it("should return a ticket by id", async () => {
      const ticketRepo = AppDataSource.getRepository(TicketDAO);
      const createdTicket = await ticketRepo.save({ service, managedBy: desk, status: StatusType.open, TimeStarted: new Date() });

      const res = await request(app).get(`/api/tickets/${createdTicket.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdTicket.id);
    });
  });

  describe("PATCH /api/tickets/:id/status", () => {
    it("should update ticket status", async () => {
      const ticketRepo = AppDataSource.getRepository(TicketDAO);
      const ticket = await ticketRepo.save({ service, managedBy: desk, status: StatusType.open, TimeStarted: new Date() });

      const res = await request(app)
        .patch(`/api/tickets/${ticket.id}/status`)
        .send({ status: StatusType.closed });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(StatusType.closed);
    });
  });

  describe("GET /api/tickets/service/:serviceId", () => {
    it("should return tickets for a service", async () => {
      const res = await request(app).get(`/api/tickets/service/${service.id}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /api/tickets/desk/:deskId", () => {
    it("should return tickets for a desk", async () => {
      const res = await request(app).get(`/api/tickets/desk/${desk.id}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});