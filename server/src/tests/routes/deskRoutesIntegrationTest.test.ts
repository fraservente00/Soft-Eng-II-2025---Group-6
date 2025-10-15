import request from "supertest";
import { app } from "../../index";
import { AppDataSource } from "../../data-source";
import { DeskRepository } from "../../repositories/DeskRepository";
import { DeskDAO } from "../../models/DAO/DeskDAO";

describe("Desk Routes Integration Tests", () => {
  beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  });


  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe("GET /api/desks", () => {
    it("should return all desks", async () => {
      // Arrange: optionally seed a few desks
      const deskRepo = AppDataSource.getRepository(DeskDAO);
      await deskRepo.save([{ name: "Desk A" }, { name: "Desk B" }]);

      // Act
      const res = await request(app).get("/api/desks");

      // Assert
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("POST /api/desks", () => {
    it("should create a new desk", async () => {
      const newDesk = { name: "Desk C" };

      const res = await request(app)
        .post("/api/desks")
        .send(newDesk)
        .set("Accept", "application/json");

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Desk C");
    });
  });

  describe("GET /api/desks/:id", () => {
    it("should return a desk by id", async () => {
      const deskRepo = AppDataSource.getRepository(DeskDAO);
      const createdDesk = await deskRepo.save({ name: "Desk D" });

      const res = await request(app).get(`/api/desks/${createdDesk.id}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Desk D");
    });
  });

  describe("PUT /api/desks/:id", () => {
    it("should update a desk", async () => {
      const deskRepo = AppDataSource.getRepository(DeskDAO);
      const desk = await deskRepo.save({ name: "Desk E" });

      const res = await request(app)
        .put(`/api/desks/${desk.id}`)
        .send({ name: "Updated Desk E" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Updated Desk E");
    });
  });

  describe("DELETE /api/desks/:id", () => {
    it("should delete a desk", async () => {
      const deskRepo = AppDataSource.getRepository(DeskDAO);
      const desk = await deskRepo.save({ name: "Desk F" });

      const res = await request(app).delete(`/api/desks/${desk.id}`);

      expect(res.status).toBe(204);

      const found = await deskRepo.findOneBy({ id: desk.id });
      expect(found).toBeNull();
    });
  });
});
