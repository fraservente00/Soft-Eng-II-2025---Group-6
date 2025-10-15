import "reflect-metadata"; // Assicurati che sia importato se necessario per TypeORM
import { Repository, SelectQueryBuilder } from "typeorm";
import { DeskDAO } from "../../models/DAO/DeskDAO"; // Percorso aggiornato
import { ServiceDAO } from "../../models/DAO/ServiceDAO"; // Percorso aggiornato
import { TicketDAO } from "../../models/DAO/TicketDAO"; // Percorso aggiornato
import { AppDataSource } from "../../data-source"; // Percorso aggiornato
import { DeskRepository } from "../../repositories/DeskRepository"; // Percorso aggiornato

// Manteniamo il mockDeskRepository più semplice per le operazioni dirette
const mockDeskRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(), // Ora è solo una jest.fn() semplice
} as unknown as jest.Mocked<Repository<DeskDAO>>;

jest.mock("../../data-source", () => ({ // Percorso aggiornato
  AppDataSource: {
    getRepository: jest.fn(() => mockDeskRepository),
  },
}));

describe("DeskRepository", () => {
  let deskRepository: DeskRepository;
  let mockRepository: jest.Mocked<Repository<DeskDAO>>;

  type MockQueryBuilder = jest.Mocked<
    Pick<
      SelectQueryBuilder<DeskDAO>,
      "innerJoin" | "where" | "getMany"
    >
  >;

  beforeEach(() => {
    // **Importante:** Resetta tutti i mock PRIMA che `deskRepository` venga istanziato
    // e prima che i mock specifici del test vengano configurati.
    jest.clearAllMocks();

    deskRepository = new DeskRepository();
    mockRepository = mockDeskRepository; // Assicurati che mockRepository punti all'istanza globale
  });

  describe("findAll", () => {
    it("should return all desks", async () => {
      const desks: DeskDAO[] = [{ id: 1, name: "Desk 1", services: [], tickets: [] }];
      mockRepository.find.mockResolvedValue(desks);

      await expect(deskRepository.findAll()).resolves.toEqual(desks);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe("findById", () => {
    it("should return a desk by id", async () => {
      const desk: DeskDAO = { id: 1, name: "Desk 1", services: [], tickets: [] };
      mockRepository.findOneBy.mockResolvedValue(desk);

      await expect(deskRepository.findById(1)).resolves.toEqual(desk);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it("should return null if desk not found", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(deskRepository.findById(999)).resolves.toBeNull();
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe("findByServiceId", () => {
    it("should return desks associated with a service ID", async () => {
      const desks: DeskDAO[] = [{ id: 1, name: "Desk 1", services: [], tickets: [] }];

      // **Questa è la parte critica:**
      // Dobbiamo definire il mock del QueryBuilder che verrà restituito
      // da mockRepository.createQueryBuilder, PRIMA che deskRepository.findByServiceId lo chiami.
      const mockQueryBuilderInstance = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(desks),
      };

      // Ora configuriamo mockRepository.createQueryBuilder per restituire il nostro mock
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilderInstance);

      await expect(deskRepository.findByServiceId(1)).resolves.toEqual(desks);

      // Verifiche
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("desk");
      expect(mockQueryBuilderInstance.innerJoin).toHaveBeenCalledWith(
        "desk.services",
        "service",
        "service.id = :serviceId",
        { serviceId: 1 }
      );
      expect(mockQueryBuilderInstance.getMany).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array if no desks are associated with the service ID", async () => {
      const emptyDesks: DeskDAO[] = [];

      const mockQueryBuilderInstance = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(emptyDesks),
      };

      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilderInstance);

      await expect(deskRepository.findByServiceId(999)).resolves.toEqual(emptyDesks);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("desk");
      expect(mockQueryBuilderInstance.innerJoin).toHaveBeenCalledWith(
        "desk.services",
        "service",
        "service.id = :serviceId",
        { serviceId: 999 }
      );
      expect(mockQueryBuilderInstance.getMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("create", () => {
    it("should create and return a new desk", async () => {
      const newDeskData: Partial<DeskDAO> = { name: "New Desk" };
      const createdDesk: DeskDAO = { id: 1, name: "New Desk", services: [], tickets: [] };

      mockRepository.create.mockReturnValue({ ...newDeskData, services: [], tickets: [] } as DeskDAO);
      mockRepository.save.mockResolvedValue(createdDesk);

      await expect(deskRepository.create(newDeskData as DeskDAO)).resolves.toEqual(createdDesk);
      expect(mockRepository.create).toHaveBeenCalledWith(newDeskData);
      expect(mockRepository.save).toHaveBeenCalledWith(
        { ...newDeskData, services: [], tickets: [] }
      );
    });
  });

  describe("update", () => {
    it("should update and return the updated desk", async () => {
      const existingDesk: DeskDAO = { id: 1, name: "Desk 1", services: [], tickets: [] };
      const updatedData: Partial<DeskDAO> = { name: "Updated Desk 1" };
      const savedDesk: DeskDAO = { ...existingDesk, ...updatedData };

      mockRepository.findOneBy.mockResolvedValue(existingDesk);
      mockRepository.save.mockResolvedValue(savedDesk);

      await expect(deskRepository.update(1, updatedData as DeskDAO)).resolves.toEqual(savedDesk);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepository.save).toHaveBeenCalledWith(savedDesk);
    });

    it("should return null if desk to update is not found", async () => {
      const updatedData: Partial<DeskDAO> = { name: "Updated Desk 999" };
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(deskRepository.update(999, updatedData as DeskDAO)).resolves.toBeNull();
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete a desk and return true if successful", async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await expect(deskRepository.delete(1)).resolves.toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should return false if desk to delete is not found", async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(deskRepository.delete(999)).resolves.toBe(false);
      expect(mockRepository.delete).toHaveBeenCalledWith(999);
    });
  });

  describe("findWithServicesById", () => {
    it("should return a desk with its services by id", async () => {
      const service1: ServiceDAO = { id: 1, name: "Service A", estimatedTime: 10, desks: [], tickets: [] };
      const deskWithServices: DeskDAO = {
        id: 1,
        name: "Desk 1",
        services: [service1],
        tickets: [],
      };

      mockRepository.findOne.mockResolvedValue(deskWithServices);

      await expect(deskRepository.findWithServicesById(1)).resolves.toEqual(
        deskWithServices
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["services"],
      });
    });

    it("should return null if desk with services not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(deskRepository.findWithServicesById(999)).resolves.toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ["services"],
      });
    });
  });
});