// server/src/tests/services/ticketService.test.ts

import { TicketService } from "../../../services/TicketService";
import { TicketRepository } from "../../../repositories/TicketRepository";
import { NotFoundError } from "../../../models/errors/NotFoundError";
import { AppDataSource } from "../../../data-source"; // Potrebbe non servire se TicketService non usa transazioni
import { TicketDAO } from "../../../models/DAO/TicketDAO";
import { ServiceDAO } from "../../../models/DAO/ServiceDAO";
import { DeskDAO } from "../../../models/DAO/DeskDAO";
import { StatusType } from "../../../models/StatusType";

// *** MOCKING DEI MAPPER A LIVELLO DI MODULO ***
// Questo sostituisce completamente il modulo mappers.ts quando viene importato
jest.mock("../../../services/mapperService", () => ({
    // Mokka mapTicketDAOToDTO
    mapTicketDAOToDTO: jest.fn((dao) => ({
        id: dao.id,
        status: dao.status,
        createdAt: dao.createdAt,
        endedAt: dao.endedAt,
        service: dao.service ? { id: dao.service.id, name: dao.service.name } : undefined,
        managedBy: dao.managedBy ? { id: dao.managedBy.id, name: dao.managedBy.name } : undefined,
    })),
    // Mokka mapTicketDTOToDAO (converte un DTO in un DAO)
    mapTicketDTOToDAO: jest.fn((dto) => {
        const dao = new TicketDAO();
        if (dto.id !== undefined) dao.id = dto.id;
        if (dto.status !== undefined) dao.status = dto.status;
        if (dto.createdAt !== undefined) dao.createdAt = dto.createdAt;
        if (dto.endedAt !== undefined) dao.endedAt = dto.endedAt;
        if (dto.service) {
            dao.service = new ServiceDAO();
            if (dto.service.id !== undefined) dao.service.id = dto.service.id;
        }
        if (dto.managedBy !== undefined) {
            if (dto.managedBy === null) {
                dao.managedBy = null;
            } else {
                dao.managedBy = new DeskDAO();
                if (dto.managedBy.id !== undefined) dao.managedBy.id = dto.managedBy.id;
            }
        }
        return dao;
    }),
    // Aggiungi qui anche gli altri mapper se TicketService li usa (es. mapDeskDAOToDTO, mapServiceDAOToDTO)
    mapDeskDAOToDTO: jest.fn((dao) => ({ id: dao.id, name: dao.name })),
    mapServiceDAOToDTO: jest.fn((dao) => ({ id: dao.id, name: dao.name, estimatedTime: dao.estimatedTime })),
}));


// Mock del TicketRepository
jest.mock("../../../repositories/TicketRepository");
// Mock di AppDataSource (potrebbe non essere usato da TicketService, ma lo lasciamo per coerenza)
jest.mock("../../../data-source", () => ({
    AppDataSource: {
        transaction: jest.fn((callback) => callback()),
    },
}));

// Importa le funzioni mockate dei mapper per poterle asserire
import { mapTicketDAOToDTO, mapTicketDTOToDAO } from "../../../services/mapperService";

describe("TicketService", () => {
    let ticketService: TicketService;
    let mockTicketRepository: jest.Mocked<TicketRepository>;

    // Dati di esempio
    const mockServiceDAO1 = new ServiceDAO();
    mockServiceDAO1.id = 1;
    mockServiceDAO1.name = "Service A";
    mockServiceDAO1.estimatedTime = 10;

    const mockDeskDAO1 = new DeskDAO();
    mockDeskDAO1.id = 10;
    mockDeskDAO1.name = "Desk 1";

    const mockTicketDAO1 = new TicketDAO();
    mockTicketDAO1.id = 1;
    mockTicketDAO1.status = StatusType.open;
    mockTicketDAO1.createdAt = new Date("2023-01-01T10:00:00Z");
    mockTicketDAO1.endedAt = null;
    mockTicketDAO1.service = mockServiceDAO1;
    mockTicketDAO1.managedBy = mockDeskDAO1;

    const mockTicketDAO2 = new TicketDAO();
    mockTicketDAO2.id = 2;
    mockTicketDAO2.status = StatusType.closed;
    mockTicketDAO2.createdAt = new Date("2023-01-01T11:00:00Z");
    mockTicketDAO2.endedAt = new Date("2023-01-01T12:00:00Z");
    mockTicketDAO2.service = mockServiceDAO1;
    mockTicketDAO2.managedBy = null;


    beforeEach(() => {
        jest.clearAllMocks(); // Pulisce i conteggi delle chiamate per tutti i mock
        ticketService = new TicketService();
        mockTicketRepository = (TicketRepository as jest.Mock).mock.instances[0];

        // Reset delle implementazioni dei mapper se necessario, altrimenti useranno quella di default dal mock
        // Fornisci implementazioni mockate generiche se i test non ne specificano una
        (mapTicketDAOToDTO as jest.Mock).mockImplementation((dao) => ({
            id: dao.id,
            status: dao.status,
            createdAt: dao.createdAt,
            endedAt: dao.endedAt,
            service: dao.service ? { id: dao.service.id, name: dao.service.name } : undefined,
            managedBy: dao.managedBy ? { id: dao.managedBy.id, name: dao.managedBy.name } : undefined,
        }));
        (mapTicketDTOToDAO as jest.Mock).mockImplementation((dto) => {
            const dao = new TicketDAO();
            if (dto.id !== undefined) dao.id = dto.id;
            if (dto.status !== undefined) dao.status = dto.status;
            if (dto.createdAt !== undefined) dao.createdAt = dto.createdAt;
            if (dto.endedAt !== undefined) dao.endedAt = dto.endedAt;
            if (dto.service) {
                dao.service = new ServiceDAO();
                if (dto.service.id !== undefined) dao.service.id = dto.service.id;
            }
            if (dto.managedBy !== undefined) {
                if (dto.managedBy === null) {
                    dao.managedBy = null;
                } else {
                    dao.managedBy = new DeskDAO();
                    if (dto.managedBy.id !== undefined) dao.managedBy.id = dto.managedBy.id;
                }
            }
            return dao;
        });
    });

    // ---------- TEST: list ----------
    describe("list", () => {
        test("should return all tickets mapped to DTOs", async () => {
            mockTicketRepository.findAll.mockResolvedValue([mockTicketDAO1, mockTicketDAO2]);

            const result = await ticketService.list();

            expect(mockTicketRepository.findAll).toHaveBeenCalledWith([]);
            expect(mapTicketDAOToDTO).toHaveBeenCalledTimes(2);
            expect(result).toEqual([
                {
                    id: 1, status: StatusType.open, createdAt: mockTicketDAO1.createdAt, endedAt: null,
                    service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                    managedBy: { id: mockDeskDAO1.id, name: mockDeskDAO1.name },
                },
                {
                    id: 2, status: StatusType.closed, createdAt: mockTicketDAO2.createdAt, endedAt: mockTicketDAO2.endedAt,
                    service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                    managedBy: undefined, // Il mock restituisce undefined per null managedBy
                },
            ]);
        });

        test("should pass relations to findAll", async () => {
            mockTicketRepository.findAll.mockResolvedValue([mockTicketDAO1]);

            const result = await ticketService.list(["service"]);

            expect(mockTicketRepository.findAll).toHaveBeenCalledWith(["service"]);
            expect(mapTicketDAOToDTO).toHaveBeenCalledTimes(1);
            expect(result).toEqual([
                {
                    id: 1, status: StatusType.open, createdAt: mockTicketDAO1.createdAt, endedAt: null,
                    service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                    managedBy: { id: mockDeskDAO1.id, name: mockDeskDAO1.name },
                },
            ]);
        });
    });

    // ---------- TEST: get ----------
    describe("get", () => {
        test("should return a single ticket mapped to DTO by ID", async () => {
            mockTicketRepository.findById.mockResolvedValue(mockTicketDAO1);

            const result = await ticketService.get(1);

            expect(mockTicketRepository.findById).toHaveBeenCalledWith(1, []);
            expect(mapTicketDAOToDTO).toHaveBeenCalledWith(mockTicketDAO1);
            expect(result).toEqual({
                id: 1, status: StatusType.open, createdAt: mockTicketDAO1.createdAt, endedAt: null,
                service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                managedBy: { id: mockDeskDAO1.id, name: mockDeskDAO1.name },
            });
        });

        test("should throw NotFoundError if ticket not found", async () => {
            mockTicketRepository.findById.mockResolvedValue(null);

            await expect(ticketService.get(99)).rejects.toThrow(NotFoundError);
            await expect(ticketService.get(99)).rejects.toThrow("Ticket with ID 99 not found");
        });

        test("should pass relations to findById", async () => {
            mockTicketRepository.findById.mockResolvedValue(mockTicketDAO1);

            const result = await ticketService.get(1, ["managedBy"]);

            expect(mockTicketRepository.findById).toHaveBeenCalledWith(1, ["managedBy"]);
            expect(mapTicketDAOToDTO).toHaveBeenCalledWith(mockTicketDAO1);
            expect(result).toEqual({
                id: 1, status: StatusType.open, createdAt: mockTicketDAO1.createdAt, endedAt: null,
                service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                managedBy: { id: mockDeskDAO1.id, name: mockDeskDAO1.name },
            });
        });
    });

    // ---------- TEST: listByService ----------
    describe("listByService", () => {
        test("should return tickets for a given service ID mapped to DTOs", async () => {
            mockTicketRepository.findByServiceId.mockResolvedValue([mockTicketDAO1]);

            const result = await ticketService.listByService(mockServiceDAO1.id);

            expect(mockTicketRepository.findByServiceId).toHaveBeenCalledWith(mockServiceDAO1.id, []);
            expect(result).toEqual([
                {
                    id: 1, status: StatusType.open, createdAt: mockTicketDAO1.createdAt, endedAt: null,
                    service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                    managedBy: { id: mockDeskDAO1.id, name: mockDeskDAO1.name },
                },
            ]);
        });

        test("should pass relations to findByServiceId", async () => {
            mockTicketRepository.findByServiceId.mockResolvedValue([mockTicketDAO1]);

            const result = await ticketService.listByService(mockServiceDAO1.id, ["service", "managedBy"]);

            expect(mockTicketRepository.findByServiceId).toHaveBeenCalledWith(mockServiceDAO1.id, ["service", "managedBy"]);
            expect(result).toEqual([
                {
                    id: 1, status: StatusType.open, createdAt: mockTicketDAO1.createdAt, endedAt: null,
                    service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                    managedBy: { id: mockDeskDAO1.id, name: mockDeskDAO1.name },
                },
            ]);
        });
    });

    // ---------- TEST: listByDesk ----------
    describe("listByDesk", () => {
        test("should return tickets for a given desk ID mapped to DTOs", async () => {
            mockTicketRepository.findByDeskId.mockResolvedValue([mockTicketDAO1]);

            const result = await ticketService.listByDesk(mockDeskDAO1.id);

            expect(mockTicketRepository.findByDeskId).toHaveBeenCalledWith(mockDeskDAO1.id, []);
            expect(result).toEqual([
                {
                    id: 1, status: StatusType.open, createdAt: mockTicketDAO1.createdAt, endedAt: null,
                    service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                    managedBy: { id: mockDeskDAO1.id, name: mockDeskDAO1.name },
                },
            ]);
        });

        test("should pass relations to findByDeskId", async () => {
            mockTicketRepository.findByDeskId.mockResolvedValue([mockTicketDAO1]);

            const result = await ticketService.listByDesk(mockDeskDAO1.id, ["service"]);

            expect(mockTicketRepository.findByDeskId).toHaveBeenCalledWith(mockDeskDAO1.id, ["service"]);
            expect(result).toEqual([
                {
                    id: 1, status: StatusType.open, createdAt: mockTicketDAO1.createdAt, endedAt: null,
                    service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                    managedBy: { id: mockDeskDAO1.id, name: mockDeskDAO1.name },
                },
            ]);
        });
    });

    // ---------- TEST: listByServiceAndStatus ----------
    describe("listByServiceAndStatus", () => {
        test("should return tickets for a given service ID and status mapped to DTOs", async () => {
            mockTicketRepository.findByServiceIdStatus.mockResolvedValue([mockTicketDAO1]);

            const result = await ticketService.listByServiceAndStatus(mockServiceDAO1.id, StatusType.open);

            expect(mockTicketRepository.findByServiceIdStatus).toHaveBeenCalledWith(mockServiceDAO1.id, StatusType.open, []);
            expect(result).toEqual([
                {
                    id: 1, status: StatusType.open, createdAt: mockTicketDAO1.createdAt, endedAt: null,
                    service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                    managedBy: { id: mockDeskDAO1.id, name: mockDeskDAO1.name },
                },
            ]);
        });

        test("should pass relations to findByServiceIdStatus", async () => {
            mockTicketRepository.findByServiceIdStatus.mockResolvedValue([mockTicketDAO1]);

            const result = await ticketService.listByServiceAndStatus(mockServiceDAO1.id, StatusType.open, ["managedBy"]);

            expect(mockTicketRepository.findByServiceIdStatus).toHaveBeenCalledWith(mockServiceDAO1.id, StatusType.open, ["managedBy"]);
            expect(result).toEqual([
                {
                    id: 1, status: StatusType.open, createdAt: mockTicketDAO1.createdAt, endedAt: null,
                    service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                    managedBy: { id: mockDeskDAO1.id, name: mockDeskDAO1.name },
                },
            ]);
        });
    });

    // ---------- TEST: create ----------
    describe("create", () => {
        test("should create a new ticket and return its DTO", async () => {
            const inputTicketDTO = {
                status: StatusType.open,
                createdAt: new Date("2023-01-02T10:00:00Z"),
                service: { id: mockServiceDAO1.id },
                managedBy: { id: mockDeskDAO1.id },
            };
            const createdTicketDAO = { ...mockTicketDAO1, id: 3 }; // Simula il DAO salvato

            (mapTicketDTOToDAO as jest.Mock).mockReturnValueOnce(createdTicketDAO); // Mocka la conversione DTO -> DAO
            mockTicketRepository.save.mockResolvedValue(createdTicketDAO);

            const result = await ticketService.create(inputTicketDTO as any);

            expect(mapTicketDTOToDAO).toHaveBeenCalledWith(inputTicketDTO);
            expect(mockTicketRepository.save).toHaveBeenCalledWith(createdTicketDAO);
            expect(mapTicketDAOToDTO).toHaveBeenCalledWith(createdTicketDAO);
            expect(result).toEqual({
                id: 3, status: StatusType.open, createdAt: createdTicketDAO.createdAt, endedAt: null,
                service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                managedBy: { id: mockDeskDAO1.id, name: mockDeskDAO1.name },
            });
        });
    });

    // ---------- TEST: update ----------
    describe("update", () => {
        test("should update an existing ticket and return its DTO", async () => {
            const updatedStatus = StatusType.closed;
            const patchInputDTO = { status: updatedStatus };
            const updatedTicketDAO = { ...mockTicketDAO1, status: updatedStatus };

            mockTicketRepository.findById.mockResolvedValue(mockTicketDAO1);
            (mapTicketDTOToDAO as jest.Mock).mockReturnValueOnce(updatedTicketDAO); // Mocka la conversione patch -> DAO
            mockTicketRepository.save.mockResolvedValue(updatedTicketDAO);

            const result = await ticketService.update(1, patchInputDTO);

            expect(mockTicketRepository.findById).toHaveBeenCalledWith(1, []);
            expect(mapTicketDTOToDAO).toHaveBeenCalledWith(patchInputDTO);
            // toSave sarà una combinazione di existing e il DAO parziale dal patch
            expect(mockTicketRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                id: mockTicketDAO1.id,
                status: updatedStatus,
                createdAt: mockTicketDAO1.createdAt, // Dovrebbe mantenere l'originale
            }));
            expect(mapTicketDAOToDTO).toHaveBeenCalledWith(updatedTicketDAO);
            expect(result).toEqual({
                id: 1, status: updatedStatus, createdAt: mockTicketDAO1.createdAt, endedAt: null,
                service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                managedBy: { id: mockDeskDAO1.id, name: mockDeskDAO1.name },
            });
        });

        test("should throw NotFoundError if ticket to update not found", async () => {
            mockTicketRepository.findById.mockResolvedValue(null);

            await expect(ticketService.update(99, { status: StatusType.closed })).rejects.toThrow(NotFoundError);
            await expect(ticketService.update(99, { status: StatusType.closed })).rejects.toThrow("Ticket with ID 99 not found");
        });
    });

    // ---------- TEST: updateStatus ----------
    describe("updateStatus", () => {
        test("should update ticket status and return its DTO", async () => {
            const newStatus = StatusType.closed;
            const updatedTicketDAO = { ...mockTicketDAO1, status: newStatus };
            mockTicketRepository.updateStatus.mockResolvedValue(updatedTicketDAO);

            const result = await ticketService.updateStatus(1, newStatus);

            expect(mockTicketRepository.updateStatus).toHaveBeenCalledWith(1, newStatus);
            expect(mapTicketDAOToDTO).toHaveBeenCalledWith(updatedTicketDAO);
            expect(result).toEqual({
                id: 1, status: newStatus, createdAt: mockTicketDAO1.createdAt, endedAt: null,
                service: { id: mockServiceDAO1.id, name: mockServiceDAO1.name },
                managedBy: { id: mockDeskDAO1.id, name: mockDeskDAO1.name },
            });
        });

        test("should throw NotFoundError if ticket to update status not found", async () => {
            mockTicketRepository.updateStatus.mockResolvedValue(null);

            await expect(ticketService.updateStatus(99, StatusType.closed)).rejects.toThrow(NotFoundError);
            await expect(ticketService.updateStatus(99, StatusType.closed)).rejects.toThrow("Ticket with ID 99 not found");
        });
    });

    // ---------- TEST: remove ----------
    describe("remove", () => {
        test("should delete a ticket by ID", async () => {
            mockTicketRepository.delete.mockResolvedValue(true); // delete restituisce boolean

            await ticketService.remove(1);

            expect(mockTicketRepository.delete).toHaveBeenCalledWith(1);
        });

        test("should throw NotFoundError if ticket to remove not found", async () => {
            mockTicketRepository.delete.mockResolvedValue(false); // delete restituisce false se non trovato

            await expect(ticketService.remove(99)).rejects.toThrow(NotFoundError);
            await expect(ticketService.remove(99)).rejects.toThrow("Ticket with ID 99 not found");
        });
    });
});