import "reflect-metadata"; // Importante per TypeORM
import { Repository, SelectQueryBuilder } from "typeorm";
import { AppDataSource } from "../../data-source"; // Percorso aggiornato
import { TicketDAO } from "../../models/DAO/TicketDAO"; // Percorso aggiornato
import { StatusType } from "../../models/StatusType"; // Percorso aggiornato
import { ServiceDAO } from "../../models/DAO/ServiceDAO"; // Per i mock delle relazioni
import { DeskDAO } from "../../models/DAO/DeskDAO"; // Per i mock delle relazioni
import { TicketRepository } from "../../repositories/TicketRepository"; // Percorso aggiornato

// --- Inizio configurazione Mock ---

// Oggetto mock per il TicketRepository
const mockTicketRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(), // Inizialmente jest.fn() semplice
} as unknown as jest.Mocked<Repository<TicketDAO>>;

// Mock di AppDataSource per restituire sempre la stessa istanza del mock del TicketRepository.
jest.mock("../../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(() => mockTicketRepository),
  },
}));

// --- Fine configurazione Mock ---

describe("TicketRepository", () => {
  let ticketRepository: TicketRepository;
  let mockRepository: jest.Mocked<Repository<TicketDAO>>;

  // Tipo per il mock del QueryBuilder per una migliore tipizzazione
  type MockQueryBuilder = jest.Mocked<
    Pick<
      SelectQueryBuilder<TicketDAO>,
      "innerJoin" | "where" | "getMany"
    >
  >;

  beforeEach(() => {
    // Resetta tutti i mock PRIMA di ogni test per garantire l'isolamento.
    jest.clearAllMocks();
    ticketRepository = new TicketRepository();
    // mockRepository ora punta all'istanza globale mockTicketRepository.
    mockRepository = mockTicketRepository;
  });

  // Oggetti ServiceDAO e DeskDAO minimali per i mock delle relazioni
  const mockService: ServiceDAO = { id: 1, name: "Test Service", estimatedTime: 10, desks: [], tickets: [] };
  const mockDesk: DeskDAO = { id: 1, name: "Test Desk", services: [], tickets: [] };


  describe("findAll", () => {
    it("should return all tickets", async () => {
      const tickets: TicketDAO[] = [
        { id: 1, status: StatusType.open, createdAt: new Date(), service: mockService, managedBy: null },
      ];
      mockRepository.find.mockResolvedValue(tickets);

      await expect(ticketRepository.findAll()).resolves.toEqual(tickets);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe("findById", () => {
    it("should return a ticket by id", async () => {
      const ticket: TicketDAO = { id: 1, status: StatusType.open, createdAt: new Date(), service: mockService, managedBy: null };
      mockRepository.findOneBy.mockResolvedValue(ticket);

      await expect(ticketRepository.findById(1)).resolves.toEqual(ticket);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it("should return null if ticket not found", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(ticketRepository.findById(999)).resolves.toBeNull();
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe("findByServiceIdStatus", () => {
    it("should return tickets associated with a service ID and status", async () => {
      const tickets: TicketDAO[] = [
        { id: 1, status: StatusType.open, createdAt: new Date(), service: mockService, managedBy: null },
      ];

      const mockQueryBuilderInstance = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(tickets),
      };
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilderInstance);

      await expect(ticketRepository.findByServiceIdStatus(1, StatusType.open)).resolves.toEqual(tickets);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("ticket");
      expect(mockQueryBuilderInstance.innerJoin).toHaveBeenCalledWith(
        "ticket.services",
        "service",
        "service.id = :serviceId",
        { serviceId: 1 }
      );
      expect(mockQueryBuilderInstance.where).toHaveBeenCalledWith("ticket.status = :status", { status: StatusType.open });
      expect(mockQueryBuilderInstance.getMany).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array if no tickets match service ID and status", async () => {
      const emptyTickets: TicketDAO[] = [];

      const mockQueryBuilderInstance = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(emptyTickets),
      };
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilderInstance);

      await expect(ticketRepository.findByServiceIdStatus(999, StatusType.closed)).resolves.toEqual(emptyTickets);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("ticket");
      expect(mockQueryBuilderInstance.innerJoin).toHaveBeenCalledWith(
        "ticket.services",
        "service",
        "service.id = :serviceId",
        { serviceId: 999 }
      );
      expect(mockQueryBuilderInstance.where).toHaveBeenCalledWith("ticket.status = :status", { status: StatusType.closed });
      expect(mockQueryBuilderInstance.getMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("findByServiceId", () => {
    it("should return tickets associated with a service ID", async () => {
      const tickets: TicketDAO[] = [
        { id: 1, status: StatusType.open, createdAt: new Date(), service: mockService, managedBy: null },
      ];

      const mockQueryBuilderInstance = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(tickets),
      };
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilderInstance);

      await expect(ticketRepository.findByServiceId(1)).resolves.toEqual(tickets);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("ticket");
      expect(mockQueryBuilderInstance.innerJoin).toHaveBeenCalledWith(
        "ticket.services",
        "service",
        "service.id = :serviceId",
        { serviceId: 1 }
      );
      expect(mockQueryBuilderInstance.getMany).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilderInstance.where).not.toHaveBeenCalled(); // Verifichiamo che 'where' non sia chiamato
    });

    it("should return an empty array if no tickets match service ID", async () => {
      const emptyTickets: TicketDAO[] = [];

      const mockQueryBuilderInstance = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(emptyTickets),
      };
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilderInstance);

      await expect(ticketRepository.findByServiceId(999)).resolves.toEqual(emptyTickets);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("ticket");
      expect(mockQueryBuilderInstance.innerJoin).toHaveBeenCalledWith(
        "ticket.services",
        "service",
        "service.id = :serviceId",
        { serviceId: 999 }
      );
      expect(mockQueryBuilderInstance.getMany).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilderInstance.where).not.toHaveBeenCalled();
    });
  });

  describe("findByDeskId", () => {
    it("should return tickets associated with a desk ID", async () => {
      const tickets: TicketDAO[] = [
        { id: 1, status: StatusType.open, createdAt: new Date(), service: mockService, managedBy: mockDesk },
      ];

      const mockQueryBuilderInstance = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(tickets),
      };
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilderInstance);

      await expect(ticketRepository.findByDeskId(1)).resolves.toEqual(tickets);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("ticket");
      expect(mockQueryBuilderInstance.innerJoin).toHaveBeenCalledWith(
        "ticket.managedBy",
        "desk",
        "desk.id = :deskId",
        { deskId: 1 }
      );
      expect(mockQueryBuilderInstance.getMany).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilderInstance.where).not.toHaveBeenCalled();
    });

    it("should return an empty array if no tickets match desk ID", async () => {
      const emptyTickets: TicketDAO[] = [];

      const mockQueryBuilderInstance = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(emptyTickets),
      };
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilderInstance);

      await expect(ticketRepository.findByDeskId(999)).resolves.toEqual(emptyTickets);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("ticket");
      expect(mockQueryBuilderInstance.innerJoin).toHaveBeenCalledWith(
        "ticket.managedBy",
        "desk",
        "desk.id = :deskId",
        { deskId: 999 }
      );
      expect(mockQueryBuilderInstance.getMany).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilderInstance.where).not.toHaveBeenCalled();
    });
  });

  describe("updateStatus", () => {
    it("should update the status of a ticket and return the updated ticket", async () => {
      const existingTicket: TicketDAO = { id: 1, status: StatusType.open, createdAt: new Date(), service: mockService, managedBy: null };
      const updatedTicket: TicketDAO = { ...existingTicket, status: StatusType.closed };

      mockRepository.findOneBy.mockResolvedValue(existingTicket);
      mockRepository.save.mockResolvedValue(updatedTicket);

      await expect(ticketRepository.updateStatus(1, StatusType.closed)).resolves.toEqual(updatedTicket);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(existingTicket.status).toBe(StatusType.closed); // Verifica che l'oggetto sia stato modificato
      expect(mockRepository.save).toHaveBeenCalledWith(existingTicket);
    });

    it("should return null if ticket to update status not found", async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(ticketRepository.updateStatus(999, StatusType.closed)).resolves.toBeNull();
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("should create and return a new ticket", async () => {
      const newTicketData: Partial<TicketDAO> = {
        status: StatusType.open,
        createdAt: new Date(),
        service: mockService,
      };
      const createdTicket: TicketDAO = { ...newTicketData, id: 1, managedBy: null } as TicketDAO;

      mockRepository.create.mockReturnValue({ ...newTicketData, managedBy: null } as TicketDAO);
      mockRepository.save.mockResolvedValue(createdTicket);

      await expect(ticketRepository.create(newTicketData)).resolves.toEqual(createdTicket);
      expect(mockRepository.create).toHaveBeenCalledWith(newTicketData);
      expect(mockRepository.save).toHaveBeenCalledWith(
        { ...newTicketData, managedBy: null }
      );
    });
  });

  describe("update", () => {
    it("should update and return the updated ticket", async () => {
      const existingTicket: TicketDAO = { id: 1, status: StatusType.open, createdAt: new Date(), service: mockService, managedBy: null };
      const updatedData: Partial<TicketDAO> = { status: StatusType.closed, endedAt: new Date() };
      const savedTicket: TicketDAO = { ...existingTicket, ...updatedData };

      mockRepository.findOneBy.mockResolvedValue(existingTicket);
      mockRepository.save.mockResolvedValue(savedTicket);

      await expect(ticketRepository.update(1, updatedData)).resolves.toEqual(savedTicket);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepository.save).toHaveBeenCalledWith(savedTicket);
    });

    it("should return null if ticket to update not found", async () => {
      const updatedData: Partial<TicketDAO> = { status: StatusType.closed };
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(ticketRepository.update(999, updatedData)).resolves.toBeNull();
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete a ticket and return true if successful", async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await expect(ticketRepository.delete(1)).resolves.toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should return false if ticket to delete not found", async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(ticketRepository.delete(999)).resolves.toBe(false);
      expect(mockRepository.delete).toHaveBeenCalledWith(999);
    });
  });
});