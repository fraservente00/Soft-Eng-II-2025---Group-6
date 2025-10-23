import express, { Express, Request, Response, NextFunction } from "express";
import request from "supertest";

// MOCK dei controller PRIMA di importare il router
jest.mock("../../controllers/serviceController", () => ({
  getServices: jest.fn(),
  getService: jest.fn(),
  createService: jest.fn(),
  updateService: jest.fn(),
  deleteService: jest.fn(),
}));

// Import dopo jest.mock per ricevere la versione mockata
import * as serviceController from "../../controllers/serviceController";
import servicesRouter from "../../routes/serviceRoutes";

// Helper: crea un'app Express minimale con il router montato e un error handler
function buildApp(): Express {
  const app = express();
  app.use(express.json());
  app.use("/api/services", servicesRouter);
  // Error handler minimale per testare next(e)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ error: message });
  });
  return app;
}

const mocked = serviceController as jest.Mocked<typeof serviceController>;

describe("serviceRoutes e2e", () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  describe("GET /api/services", () => {
    it("ritorna 200 e l'elenco dei servizi", async () => {
      const data = [{ id: 1, name: "Service A", estimatedTime: 10 }];
      mocked.getServices.mockResolvedValueOnce(data as any);

      const res = await request(app).get("/api/services");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(data);
      expect(mocked.getServices).toHaveBeenCalledTimes(1);
      expect(mocked.getServices).toHaveBeenCalledWith();
    });

    it("propaga l'errore al middleware (500 di default)", async () => {
      mocked.getServices.mockRejectedValueOnce(new Error("boom"));

      const res = await request(app).get("/api/services");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "boom" });
    });
  });

  describe("GET /api/services/:id", () => {
    it("ritorna 200 e il servizio richiesto", async () => {
      const service = { id: 42, name: "Service 42", estimatedTime: 15 };
      mocked.getService.mockResolvedValueOnce(service as any);

      const res = await request(app).get("/api/services/42");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(service);
      expect(mocked.getService).toHaveBeenCalledTimes(1);
      expect(mocked.getService).toHaveBeenCalledWith(42);
    });

    it("con id non numerico passa NaN al controller (nessuna validazione lato router)", async () => {
      mocked.getService.mockResolvedValueOnce({} as any);

      const res = await request(app).get("/api/services/abc");

      expect(res.status).toBe(200);
      expect(mocked.getService).toHaveBeenCalledTimes(1);
      const arg = mocked.getService.mock.calls[0][0];
      expect(Number.isNaN(arg)).toBe(true);
    });

    it("propaga errori del controller (es. 404)", async () => {
      const err: any = new Error("Not Found");
      err.status = 404;
      mocked.getService.mockRejectedValueOnce(err);

      const res = await request(app).get("/api/services/99");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Not Found" });
    });
  });

  describe("POST /api/services", () => {
    it("ritorna 201 e l'oggetto creato", async () => {
      const payload = { name: "New Service", estimatedTime: 12 };
      const created = { id: 10, ...payload };
      mocked.createService.mockResolvedValueOnce(created as any);

      const res = await request(app).post("/api/services").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
      expect(mocked.createService).toHaveBeenCalledTimes(1);
      expect(mocked.createService).toHaveBeenCalledWith(payload);
    });

    it("propaga errori del controller (es. 400)", async () => {
      const err: any = new Error("Bad Request");
      err.status = 400;
      mocked.createService.mockRejectedValueOnce(err);

      const res = await request(app).post("/api/services").send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Bad Request" });
    });
  });

  describe("PUT /api/services/:id", () => {
    it("ritorna 200 e l'oggetto aggiornato", async () => {
      const payload = { name: "Updated", estimatedTime: 20 };
      const updated = { id: 5, ...payload };
      mocked.updateService.mockResolvedValueOnce(updated as any);

      const res = await request(app).put("/api/services/5").send(payload);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
      expect(mocked.updateService).toHaveBeenCalledTimes(1);
      expect(mocked.updateService).toHaveBeenCalledWith(5, payload);
    });

    it("propaga errori del controller (es. 404)", async () => {
      const err: any = new Error("Not Found");
      err.status = 404;
      mocked.updateService.mockRejectedValueOnce(err);

      const res = await request(app).put("/api/services/123").send({ name: "X" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Not Found" });
    });
  });

  describe("DELETE /api/services/:id", () => {
    it("ritorna 204 senza body", async () => {
      mocked.deleteService.mockResolvedValueOnce(undefined as any);

      const res = await request(app).delete("/api/services/7");

      expect(res.status).toBe(204);
      expect(res.text).toBe(""); // nessun body
      expect(mocked.deleteService).toHaveBeenCalledTimes(1);
      expect(mocked.deleteService).toHaveBeenCalledWith(7);
    });

    it("propaga errori del controller", async () => {
      const err: any = new Error("Boom");
      err.status = 500;
      mocked.deleteService.mockRejectedValueOnce(err);

      const res = await request(app).delete("/api/services/7");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Boom" });
    });
  });
});