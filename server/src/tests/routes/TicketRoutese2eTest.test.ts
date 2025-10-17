import express, { Express, Request, Response, NextFunction } from "express";
import request from "supertest";

// MOCK dei controller PRIMA di importare il router
jest.mock("../../controllers/ticketController", () => ({
  getTickets: jest.fn(),
  getTicket: jest.fn(),
  createTicket: jest.fn(),
  updateTicketStatus: jest.fn(),
  getTicketsByServiceId: jest.fn(),
  getTicketsByDeskId: jest.fn(),
  // getTicketETA non è esposto dal router (commentato), non lo mockiamo
}));

// Import dopo jest.mock per ricevere la versione mockata
import * as ticketController from "../../controllers/ticketController";
import ticketsRouter from "../../routes/ticketRoutes";

// Helper: crea un'app Express minimale con il router montato e un error handler
function buildApp(): Express {
  const app = express();
  app.use(express.json());
  app.use("/api/tickets", ticketsRouter);
  // Error handler minimale per testare next(e)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ error: message });
  });
  return app;
}

const mocked = ticketController as jest.Mocked<typeof ticketController>;

describe("ticketRoutes e2e", () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  // GET /api/tickets
  describe("GET /api/tickets", () => {
    it("ritorna 200 e la lista dei ticket", async () => {
      const data = [{ id: 1, status: "open" }, { id: 2, status: "closed" }];
      mocked.getTickets.mockResolvedValueOnce(data as any);

      const res = await request(app).get("/api/tickets");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(data);
      expect(mocked.getTickets).toHaveBeenCalledTimes(1);
      expect(mocked.getTickets).toHaveBeenCalledWith();
    });

    it("propaga l'errore al middleware (500 di default)", async () => {
      mocked.getTickets.mockRejectedValueOnce(new Error("boom"));

      const res = await request(app).get("/api/tickets");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "boom" });
    });
  });

  // GET /api/tickets/:id
  describe("GET /api/tickets/:id", () => {
    it("ritorna 200 e il ticket richiesto", async () => {
      const ticket = { id: 42, status: "open" };
      mocked.getTicket.mockResolvedValueOnce(ticket as any);

      const res = await request(app).get("/api/tickets/42");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(ticket);
      expect(mocked.getTicket).toHaveBeenCalledTimes(1);
      expect(mocked.getTicket).toHaveBeenCalledWith(42);
    });

    it("con id non numerico passa NaN al controller (nessuna validazione lato router)", async () => {
      mocked.getTicket.mockResolvedValueOnce({} as any);

      const res = await request(app).get("/api/tickets/abc");

      expect(res.status).toBe(200);
      expect(mocked.getTicket).toHaveBeenCalledTimes(1);
      const arg = mocked.getTicket.mock.calls[0][0];
      expect(Number.isNaN(arg)).toBe(true);
    });

    it("propaga errori del controller (es. 404)", async () => {
      const err: any = new Error("Not Found");
      err.status = 404;
      mocked.getTicket.mockRejectedValueOnce(err);

      const res = await request(app).get("/api/tickets/99");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Not Found" });
    });
  });

  // POST /api/tickets
  describe("POST /api/tickets", () => {
    it("ritorna 201 e l'oggetto creato", async () => {
      const payload = { serviceId: 10 };
      const created = { id: 7, status: "open", service: { id: 10 } };
      mocked.createTicket.mockResolvedValueOnce(created as any);

      const res = await request(app).post("/api/tickets").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
      expect(mocked.createTicket).toHaveBeenCalledTimes(1);
      expect(mocked.createTicket).toHaveBeenCalledWith(payload);
    });

    it("propaga errori del controller (es. 400)", async () => {
      const err: any = new Error("Bad Request");
      err.status = 400;
      mocked.createTicket.mockRejectedValueOnce(err);

      const res = await request(app).post("/api/tickets").send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Bad Request" });
    });
  });

  // PATCH /api/tickets/:id/status
  describe("PATCH /api/tickets/:id/status", () => {
    it("ritorna 200 e l'oggetto aggiornato", async () => {
      const updated = { id: 5, status: "closed" };
      mocked.updateTicketStatus.mockResolvedValueOnce(updated as any);

      const res = await request(app)
        .patch("/api/tickets/5/status")
        .send({ status: "closed" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
      expect(mocked.updateTicketStatus).toHaveBeenCalledTimes(1);
      expect(mocked.updateTicketStatus).toHaveBeenCalledWith(5, "closed");
    });

    it("propaga errori del controller (es. 404)", async () => {
      const err: any = new Error("Not Found");
      err.status = 404;
      mocked.updateTicketStatus.mockRejectedValueOnce(err);

      const res = await request(app)
        .patch("/api/tickets/123/status")
        .send({ status: "closed" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Not Found" });
    });
  });

  // GET /api/tickets/service/:serviceId
  describe("GET /api/tickets/service/:serviceId", () => {
    it("ritorna 200 e i ticket del service", async () => {
      const data = [{ id: 1 }, { id: 2 }];
      mocked.getTicketsByServiceId.mockResolvedValueOnce(data as any);

      const res = await request(app).get("/api/tickets/service/10");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(data);
      expect(mocked.getTicketsByServiceId).toHaveBeenCalledTimes(1);
      expect(mocked.getTicketsByServiceId).toHaveBeenCalledWith(10);
    });

    it("propaga errori del controller", async () => {
      const err: any = new Error("Boom");
      err.status = 500;
      mocked.getTicketsByServiceId.mockRejectedValueOnce(err);

      const res = await request(app).get("/api/tickets/service/10");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Boom" });
    });
  });

  // GET /api/tickets/desk/:deskId
  describe("GET /api/tickets/desk/:deskId", () => {
    it("ritorna 200 e i ticket del desk", async () => {
      const data = [{ id: 11 }, { id: 12 }];
      mocked.getTicketsByDeskId.mockResolvedValueOnce(data as any);

      const res = await request(app).get("/api/tickets/desk/3");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(data);
      expect(mocked.getTicketsByDeskId).toHaveBeenCalledTimes(1);
      expect(mocked.getTicketsByDeskId).toHaveBeenCalledWith(3);
    });

    it("propaga errori del controller", async () => {
      const err: any = new Error("Boom");
      err.status = 500;
      mocked.getTicketsByDeskId.mockRejectedValueOnce(err);

      const res = await request(app).get("/api/tickets/desk/3");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Boom" });
    });
  });
});