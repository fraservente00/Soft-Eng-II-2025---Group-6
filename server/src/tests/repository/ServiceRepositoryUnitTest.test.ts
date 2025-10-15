import "reflect-metadata"; // Importante per TypeORM
import { Repository, SelectQueryBuilder } from "typeorm";
import { AppDataSource } from "../../data-source"; // Percorso aggiornato
import { ServiceDAO } from "../../models/DAO/ServiceDAO"; // Percorso aggiornato
import { DeskDAO } from "../../models/DAO/DeskDAO"; // Potrebbe essere necessario per i mock delle relazioni
import { TicketDAO } from "../../models/DAO/TicketDAO"; // Potrebbe essere necessario per i mock delle relazioni
import { ServiceRepository } from "../../repositories/ServiceRepository"; // Percorso aggiornato

// --- Inizio configurazione Mock ---

// Oggetto mock per il ServiceRepository, con tutti i metodi che verranno usati.
// `createQueryBuilder` viene inizialmente mockato come jest.fn() semplice.
const mockServiceRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
} as unknown as jest.Mocked<Repository<ServiceDAO>>;

// Mock di AppDataSource per restituire sempre la stessa istanza del mock del ServiceRepository.
jest.mock("../../data-source", () => ({ // Percorso aggiornato
  AppDataSource: {
    getRepository: jest.fn(() => mockServiceRepository),
  },
}));

// --- Fine configurazione Mock ---

describe("ServiceRepository", () => {
  let serviceRepository: ServiceRepository;
  let mockRepository: jest.Mocked<Repository<ServiceDAO>>;

  // Tipo per il mock del QueryBuilder per una migliore tipizzazione
  type MockQueryBuilder = jest.Mocked<
    Pick<
      SelectQueryBuilder<ServiceDAO>,
      "innerJoin" | "where" | "getMany"
    >
  >;

  beforeEach(() => {
    // Resetta tutti i mock PRIMA di ogni test per garantire l'isolamento.
    jest.clearAllMocks();
    serviceRepository = new ServiceRepository();
    // mockRepository ora punta all'istanza globale mockServiceRepository.
    mockRepository = mockServiceRepository;
  });

  describe("findAll", () => {
    it("should return all services", async () => {
      // Un mock completo di ServiceDAO
      const services: ServiceDAO[] = [{ id: 1, name: "Service A", estimatedTime: 10, desks: [], tickets: [] }];
      mockRepository.find.mockResolvedValue(services);

      await expect(serviceRepository.findAll()).resolves.toEqual(services);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe("findById", () => {
    it("should return a service by id", async () => {
      const service: ServiceDAO = { id: 1, name: "Service A", estimatedTime: 10, desks: [], tickets: [] };
      mockRepository.findOneBy.mockResolvedValue(service);

      await expect(serviceRepository.findById(1)).resolves.toEqual(service);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it("should return null if service not found", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(serviceRepository.findById(999)).resolves.toBeNull();
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe("findByDeskId", () => {
    it("should return services associated with a desk ID", async () => {
      const services: ServiceDAO[] = [{ id: 1, name: "Service A", estimatedTime: 10, desks: [], tickets: [] }];

      // Mockiamo l'oggetto QueryBuilder che createQueryBuilder dovrebbe restituire
      const mockQueryBuilderInstance = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(services),
      };

      // Facciamo in modo che mockRepository.createQueryBuilder restituisca questa istanza mockata
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilderInstance);

      await expect(serviceRepository.findByDeskId(1)).resolves.toEqual(services);

      // Verifiche
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("service");
      expect(mockQueryBuilderInstance.innerJoin).toHaveBeenCalledWith(
        "service.desks",
        "desk",
        "desk.id = :deskId",
        { deskId: 1 }
      );
      expect(mockQueryBuilderInstance.getMany).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array if no services are associated with the desk ID", async () => {
      const emptyServices: ServiceDAO[] = [];

      const mockQueryBuilderInstance = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(emptyServices),
      };

      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilderInstance);

      await expect(serviceRepository.findByDeskId(999)).resolves.toEqual(emptyServices);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("service");
      expect(mockQueryBuilderInstance.innerJoin).toHaveBeenCalledWith(
        "service.desks",
        "desk",
        "desk.id = :deskId",
        { deskId: 999 }
      );
      expect(mockQueryBuilderInstance.getMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("create", () => {
    it("should create and return a new service", async () => {
      const newServiceData: Partial<ServiceDAO> = { name: "New Service", estimatedTime: 15 };
      const createdService: ServiceDAO = { id: 1, name: "New Service", estimatedTime: 15, desks: [], tickets: [] };

      // Simulate TypeORM's create: take partial data, return an entity instance (might have default relations)
      mockRepository.create.mockReturnValue({ ...newServiceData, desks: [], tickets: [] } as ServiceDAO);
      mockRepository.save.mockResolvedValue(createdService);

      await expect(serviceRepository.create(newServiceData as ServiceDAO)).resolves.toEqual(createdService);
      expect(mockRepository.create).toHaveBeenCalledWith(newServiceData);
      expect(mockRepository.save).toHaveBeenCalledWith(
        { ...newServiceData, desks: [], tickets: [] } // What was returned by .create()
      );
    });
  });

  describe("update", () => {
    it("should update and return the updated service", async () => {
      const existingService: ServiceDAO = { id: 1, name: "Service A", estimatedTime: 10, desks: [], tickets: [] };
      const updatedData: Partial<ServiceDAO> = { name: "Updated Service A", estimatedTime: 20 };
      const savedService: ServiceDAO = { ...existingService, ...updatedData };

      mockRepository.findOneBy.mockResolvedValue(existingService);
      mockRepository.save.mockResolvedValue(savedService);

      await expect(serviceRepository.update(1, updatedData as ServiceDAO)).resolves.toEqual(savedService);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepository.save).toHaveBeenCalledWith(savedService);
    });

    it("should return null if service to update is not found", async () => {
      const updatedData: Partial<ServiceDAO> = { name: "Updated Service 999", estimatedTime: 30 };
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(serviceRepository.update(999, updatedData as ServiceDAO)).resolves.toBeNull();
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete a service and return true if successful", async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await expect(serviceRepository.delete(1)).resolves.toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should return false if service to delete is not found", async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(serviceRepository.delete(999)).resolves.toBe(false);
      expect(mockRepository.delete).toHaveBeenCalledWith(999);
    });
  });
});