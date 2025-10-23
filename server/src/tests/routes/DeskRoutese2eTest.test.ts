import express, { Express, Request, Response, NextFunction } from "express";
import request from "supertest";

// MOCK dei controller PRIMA di importare il router
jest.mock("../../controllers/deskController", () => ({
  getDesks: jest.fn(),
  getDesk: jest.fn(),
  createDesk: jest.fn(),
  updateDesk: jest.fn(),
  deleteDesk: jest.fn(),
}));

// Import dopo jest.mock per ricevere la versione mockata
import * as deskController from "../../controllers/deskController";
import desksRouter from "../../routes/deskRoutes";

// Helper: crea un'app Express minimale con il router montato e un error handler
function buildApp(): Express {
  const app = express();
  app.use(express.json());
  app.use("/api/desks", desksRouter);
  // Error handler minimale per testare next(e)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ error: message });
  });
  return app;
}

const mocked = deskController as jest.Mocked<typeof deskController>;

describe("deskRoutes e2e", () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  describe("GET /api/desks", () => {
    it("ritorna 200 e l'elenco dei desks", async () => {
      const data = [{ id: 1, name: "Desk A" }, { id: 2, name: "Desk B" }];
      mocked.getDesks.mockResolvedValueOnce(data as any);

      const res = await request(app).get("/api/desks");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(data);
      expect(mocked.getDesks).toHaveBeenCalledTimes(1);
      expect(mocked.getDesks).toHaveBeenCalledWith();
    });

    it("propaga l'errore al middleware (500 di default)", async () => {
      mocked.getDesks.mockRejectedValueOnce(new Error("boom"));

      const res = await request(app).get("/api/desks");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "boom" });
    });
  });

  describe("GET /api/desks/:id", () => {
    it("ritorna 200 e il desk richiesto", async () => {
      const desk = { id: 42, name: "Desk 42" };
      mocked.getDesk.mockResolvedValueOnce(desk as any);

      const res = await request(app).get("/api/desks/42");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(desk);
      expect(mocked.getDesk).toHaveBeenCalledTimes(1);
      expect(mocked.getDesk).toHaveBeenCalledWith(42);
    });

    it("con id non numerico passa NaN al controller (nessuna validazione lato router)", async () => {
      mocked.getDesk.mockResolvedValueOnce({} as any);

      const res = await request(app).get("/api/desks/abc");

      expect(res.status).toBe(200);
      expect(mocked.getDesk).toHaveBeenCalledTimes(1);
      const arg = mocked.getDesk.mock.calls[0][0];
      expect(Number.isNaN(arg)).toBe(true);
    });

    it("propaga errori del controller (es. 404)", async () => {
      const err: any = new Error("Not Found");
      err.status = 404;
      mocked.getDesk.mockRejectedValueOnce(err);

      const res = await request(app).get("/api/desks/99");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Not Found" });
    });
  });

  describe("POST /api/desks", () => {
    it("ritorna 201 e l'oggetto creato", async () => {
      const payload = { name: "New Desk" };
      const created = { id: 10, name: "New Desk" };
      mocked.createDesk.mockResolvedValueOnce(created as any);

      const res = await request(app).post("/api/desks").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
      expect(mocked.createDesk).toHaveBeenCalledTimes(1);
      expect(mocked.createDesk).toHaveBeenCalledWith(payload);
    });

    it("propaga errori del controller (es. 400)", async () => {
      const err: any = new Error("Bad Request");
      err.status = 400;
      mocked.createDesk.mockRejectedValueOnce(err);

      const res = await request(app).post("/api/desks").send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Bad Request" });
    });
  });

  describe("PUT /api/desks/:id", () => {
    it("ritorna 200 e l'oggetto aggiornato", async () => {
      const payload = { name: "Updated" };
      const updated = { id: 5, name: "Updated" };
      mocked.updateDesk.mockResolvedValueOnce(updated as any);

      const res = await request(app).put("/api/desks/5").send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
      expect(mocked.updateDesk).toHaveBeenCalledTimes(1);
      expect(mocked.updateDesk).toHaveBeenCalledWith(5, payload);
    });

    it("propaga errori del controller (es. 404)", async () => {
      const err: any = new Error("Not Found");
      err.status = 404;
      mocked.updateDesk.mockRejectedValueOnce(err);

      const res = await request(app).put("/api/desks/123").send({ name: "X" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Not Found" });
    });
  });

  describe("DELETE /api/desks/:id", () => {
    it("ritorna 204 senza body", async () => {
      mocked.deleteDesk.mockResolvedValueOnce(undefined as any);

      const res = await request(app).delete("/api/desks/7");

      expect(res.status).toBe(204);
      expect(res.text).toBe(""); // nessun body
      expect(mocked.deleteDesk).toHaveBeenCalledTimes(1);
      expect(mocked.deleteDesk).toHaveBeenCalledWith(7);
    });

    it("propaga errori del controller", async () => {
      const err: any = new Error("Boom");
      err.status = 500;
      mocked.deleteDesk.mockRejectedValueOnce(err);

      const res = await request(app).delete("/api/desks/7");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Boom" });
    });
  });
});