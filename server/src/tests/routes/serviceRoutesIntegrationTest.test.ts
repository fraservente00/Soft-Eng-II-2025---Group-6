import request from "supertest";
import { app } from "../../index";
import { AppDataSource } from "../../data-source";
import { ServiceDAO } from "../../models/DAO/ServiceDAO";

describe("Service Routes Integration Tests", () => {

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe("GET /api/services", () => {
    it("should return all services", async () => {
      const serviceRepo = AppDataSource.getRepository(ServiceDAO);
      await serviceRepo.save([{ estimatedTime: 30 }, { estimatedTime: 45 }]);

      const res = await request(app).get("/api/services");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("POST /api/services", () => {
    it("should create a new service", async () => {
      const newService = { estimatedTime: 60 };

      const res = await request(app)
        .post("/api/services")
        .send(newService)
        .set("Accept", "application/json");

      expect(res.status).toBe(201);
      expect(res.body.estimatedTime).toBe(60);
    });
  });

  describe("GET /api/services/:id", () => {
    it("should return a service by id", async () => {
      const serviceRepo = AppDataSource.getRepository(ServiceDAO);
      const createdService = await serviceRepo.save({ estimatedTime: 25 });

      const res = await request(app).get(`/api/services/${createdService.id}`);

      expect(res.status).toBe(200);
      expect(res.body.estimatedTime).toBe(25);
    });
  });

  describe("PUT /api/services/:id", () => {
    it("should update a service", async () => {
      const serviceRepo = AppDataSource.getRepository(ServiceDAO);
      const service = await serviceRepo.save({ estimatedTime: 20 });

      const res = await request(app)
        .put(`/api/services/${service.id}`)
        .send({ estimatedTime: 50 });

      expect(res.status).toBe(200);
      expect(res.body.estimatedTime).toBe(50);
    });
  });

  describe("DELETE /api/services/:id", () => {
    it("should delete a service", async () => {
      const serviceRepo = AppDataSource.getRepository(ServiceDAO);
      const service = await serviceRepo.save({ estimatedTime: 15 });

      const res = await request(app).delete(`/api/services/${service.id}`);

      expect(res.status).toBe(204);

      const found = await serviceRepo.findOneBy({ id: service.id });
      expect(found).toBeNull();
    });
  });

});
