// server/src/tests/services/serviceService.test.ts

import { ServiceService } from "../../../services/ServiceService";
import { ServiceRepository } from "../../../repositories/ServiceRepository";
import { NotFoundError } from "../../../models/errors/NotFoundError";
import { AppDataSource } from "../../../data-source";
import { ServiceDAO } from "../../../models/DAO/ServiceDAO";
import { DeskDAO } from "../../../models/DAO/DeskDAO";
import * as mappersModule from "../../../services/mapperService"; // Importa l'intero modulo

// Mock del ServiceRepository
jest.mock("../../../repositories/ServiceRepository");
// Mock di AppDataSource per le transazioni
jest.mock("../../../data-source", () => ({
    AppDataSource: {
        transaction: jest.fn((callback) => callback()), // Simula l'esecuzione immediata della transazione
    },
}));

describe("ServiceService", () => {
    let serviceService: ServiceService;
    let mockServiceRepository: jest.Mocked<ServiceRepository>;

    // Variabile per il mock di mapServiceDAOToDTO, accessibile in tutti i test
    let mockMapServiceDAOToDTO: jest.Mock;

    // Dati di esempio
    const mockServiceDAO1 = new ServiceDAO();
    mockServiceDAO1.id = 1;
    mockServiceDAO1.name = "Service A";
    mockServiceDAO1.estimatedTime = 10;
    mockServiceDAO1.desks = [];
    mockServiceDAO1.tickets = [];

    const mockServiceDAO2 = new ServiceDAO();
    mockServiceDAO2.id = 2;
    mockServiceDAO2.name = "Service B";
    mockServiceDAO2.estimatedTime = 20;
    mockServiceDAO2.desks = [];
    mockServiceDAO2.tickets = [];

    const mockDeskDAO1 = new DeskDAO();
    mockDeskDAO1.id = 10;
    mockDeskDAO1.name = "Desk 1";

    const mockDeskDAO2 = new DeskDAO();
    mockDeskDAO2.id = 20;
    mockDeskDAO2.name = "Desk 2";

    const mockServiceWithDesksDAO = new ServiceDAO();
    mockServiceWithDesksDAO.id = 3;
    mockServiceWithDesksDAO.name = "Service C";
    mockServiceWithDesksDAO.estimatedTime = 30;
    mockServiceWithDesksDAO.desks = [mockDeskDAO1];
    mockServiceWithDesksDAO.tickets = [];


    beforeEach(() => {
        jest.clearAllMocks(); // Pulisce i mock esistenti e il conteggio delle chiamate

        // *** DEFINIZIONE E ASSEGNAZIONE DEL MOCK PER mapServiceDAOToDTO ***
        // Definiamo mockMapServiceDAOToDTO come una funzione Jest mockabile
        // che accetta un solo argomento (ServiceDAO)
        mockMapServiceDAOToDTO = jest.fn((dao: ServiceDAO) => ({
            id: dao.id,
            name: dao.name,
            estimatedTime: dao.estimatedTime,
            desks: dao.desks?.map((d) => ({ id: d.id, name: d.name })) || [],
        }));

        // Assegniamo il nostro mock alla funzione reale nel modulo dei mappers
        // Questo è il passaggio chiave per garantire che la ServiceService chiami il nostro mock
        (mappersModule.mapServiceDAOToDTO as jest.Mock) = mockMapServiceDAOToDTO;
        // *******************************************************************

        serviceService = new ServiceService();
        mockServiceRepository = (ServiceRepository as jest.Mock).mock.instances[0];
    });

    // ---------- TEST: list ----------
    describe("list", () => {
        test("should return all services mapped to DTOs", async () => {
            mockServiceRepository.findAll.mockResolvedValue([mockServiceDAO1, mockServiceDAO2]);

            const result = await serviceService.list();

            expect(mockServiceRepository.findAll).toHaveBeenCalledWith([]);
            expect(mockMapServiceDAOToDTO).toHaveBeenCalledTimes(2); // Ora usiamo il nostro mock
            expect(result).toEqual([
                { id: 1, name: "Service A", estimatedTime: 10, desks: [] },
                { id: 2, name: "Service B", estimatedTime: 20, desks: [] },
            ]);
        });

        test("should pass relations to findAll", async () => {
            mockServiceRepository.findAll.mockResolvedValue([mockServiceWithDesksDAO]);

            const result = await serviceService.list(["desks"]);

            expect(mockServiceRepository.findAll).toHaveBeenCalledWith(["desks"]);
            expect(mockMapServiceDAOToDTO).toHaveBeenCalledTimes(1); // Ora usiamo il nostro mock
            expect(result).toEqual([{
                id: 3,
                name: "Service C",
                estimatedTime: 30,
                desks: [{ id: mockDeskDAO1.id, name: mockDeskDAO1.name }]
            }]);
        });
    });

    // ---------- TEST: get ----------
    describe("get", () => {
        test("should return a single service mapped to DTO by ID", async () => {
            mockServiceRepository.findById.mockResolvedValue(mockServiceDAO1);

            const result = await serviceService.get(1);

            expect(mockServiceRepository.findById).toHaveBeenCalledWith(1, []);
            expect(mockMapServiceDAOToDTO).toHaveBeenCalledWith(mockServiceDAO1); // Ora usiamo il nostro mock
            expect(result).toEqual({ id: 1, name: "Service A", estimatedTime: 10, desks: [] });
        });

        test("should throw NotFoundError if service not found", async () => {
            mockServiceRepository.findById.mockResolvedValue(null);

            await expect(serviceService.get(99)).rejects.toThrow(NotFoundError);
            await expect(serviceService.get(99)).rejects.toThrow("Service with ID 99 not found");
        });

        test("should pass relations to findById", async () => {
            mockServiceRepository.findById.mockResolvedValue(mockServiceWithDesksDAO);

            const result = await serviceService.get(3, ["desks"]);

            expect(mockServiceRepository.findById).toHaveBeenCalledWith(3, ["desks"]);
            expect(mockMapServiceDAOToDTO).toHaveBeenCalledWith(mockServiceWithDesksDAO); // Ora usiamo il nostro mock
            expect(result).toEqual({
                id: 3,
                name: "Service C",
                estimatedTime: 30,
                desks: [{ id: mockDeskDAO1.id, name: mockDeskDAO1.name }]
            });
        });
    });

    // ---------- TEST: listByDesk ----------
    describe("listByDesk", () => {
        test("should return services for a given desk ID mapped to DTOs", async () => {
            mockServiceRepository.findByDeskId.mockResolvedValue([mockServiceDAO1]);

            const result = await serviceService.listByDesk(mockDeskDAO1.id);

            expect(mockServiceRepository.findByDeskId).toHaveBeenCalledWith(mockDeskDAO1.id, []);
            expect(result).toEqual([{ id: 1, name: "Service A", estimatedTime: 10, desks: [] }]);
        });

        test("should pass relations to findByDeskId", async () => {
            mockServiceRepository.findByDeskId.mockResolvedValue([mockServiceWithDesksDAO]);

            const result = await serviceService.listByDesk(mockDeskDAO1.id, ["desks"]);

            expect(mockServiceRepository.findByDeskId).toHaveBeenCalledWith(mockDeskDAO1.id, ["desks"]);
            expect(result).toEqual([{
                id: 3,
                name: "Service C",
                estimatedTime: 30,
                desks: [{ id: mockDeskDAO1.id, name: mockDeskDAO1.name }]
            }]);
        });
    });

    // ---------- TEST: create ----------
    describe("create", () => {
        test("should create a new service and return its DTO", async () => {
            mockServiceRepository.findByName.mockResolvedValue(null); // Nessun nome duplicato
            mockServiceRepository.findDesksByIds.mockResolvedValue([mockDeskDAO1]); // Desks trovate
            mockServiceRepository.save.mockResolvedValue(mockServiceWithDesksDAO); // Service salvato

            const input = { name: "New Service", estimatedTime: 45, deskIds: [mockDeskDAO1.id] };
            const result = await serviceService.create(input);

            expect(mockServiceRepository.findByName).toHaveBeenCalledWith(input.name);
            expect(AppDataSource.transaction).toHaveBeenCalled();
            expect(mockServiceRepository.findDesksByIds).toHaveBeenCalledWith(input.deskIds);
            expect(mockServiceRepository.save).toHaveBeenCalledWith(expect.any(ServiceDAO));
            const savedServiceDAO = (mockServiceRepository.save as jest.Mock).mock.calls[0][0];
            expect(savedServiceDAO.name).toBe(input.name);
            expect(savedServiceDAO.estimatedTime).toBe(input.estimatedTime);
            expect(savedServiceDAO.desks).toEqual([mockDeskDAO1]);
            expect(mockMapServiceDAOToDTO).toHaveBeenCalledWith(mockServiceWithDesksDAO); // Ora usiamo il nostro mock
            expect(result).toEqual({
                id: 3,
                name: "Service C",
                estimatedTime: 30,
                desks: [{ id: mockDeskDAO1.id, name: mockDeskDAO1.name }]
            });
        });

        test("should create a new service without desks", async () => {
            const serviceDAOWithoutDesks = { ...mockServiceDAO1, id: 4, name: "Service No Desks", estimatedTime: 50 };
            mockServiceRepository.findByName.mockResolvedValue(null);
            mockServiceRepository.save.mockResolvedValue(serviceDAOWithoutDesks);

            const input = { name: "Service No Desks", estimatedTime: 50 };
            const result = await serviceService.create(input);

            expect(mockServiceRepository.findByName).toHaveBeenCalledWith(input.name);
            expect(AppDataSource.transaction).toHaveBeenCalled();
            expect(mockServiceRepository.findDesksByIds).not.toHaveBeenCalled();
            expect(mockServiceRepository.save).toHaveBeenCalledWith(expect.any(ServiceDAO));
            const savedServiceDAO = (mockServiceRepository.save as jest.Mock).mock.calls[0][0];
            expect(savedServiceDAO.name).toBe(input.name);
            expect(savedServiceDAO.estimatedTime).toBe(input.estimatedTime);
            expect(savedServiceDAO.desks).toBeUndefined(); // O [] a seconda dell'inizializzazione DAO
            expect(mockMapServiceDAOToDTO).toHaveBeenCalledWith(serviceDAOWithoutDesks); // Ora usiamo il nostro mock
            expect(result).toEqual({ id: 4, name: "Service No Desks", estimatedTime: 50, desks: [] });
        });


        test("should throw DUPLICATE_NAME error if service name already exists", async () => {
            mockServiceRepository.findByName.mockResolvedValue(mockServiceDAO1); // Nome duplicato

            const input = { name: "Service A", estimatedTime: 10 };
            await expect(serviceService.create(input)).rejects.toEqual(
                expect.objectContaining({
                    message: "Service name must be unique",
                    code: "DUPLICATE_NAME",
                })
            );
            expect(AppDataSource.transaction).not.toHaveBeenCalled(); // Non dovrebbe avviare la transazione
            expect(mockServiceRepository.save).not.toHaveBeenCalled();
        });
    });

    // ---------- TEST: update ----------
    describe("update", () => {
        test("should update service name and estimatedTime and return updated DTO", async () => {
            const existingService = { ...mockServiceDAO1, name: "Old Name", estimatedTime: 5 };
            const updatedServiceDAO = { ...existingService, name: "New Name", estimatedTime: 15 };
            mockServiceRepository.findById.mockResolvedValue(existingService);
            mockServiceRepository.findByName.mockResolvedValue(null); // Nessun nome duplicato
            mockServiceRepository.save.mockResolvedValue(updatedServiceDAO);

            const input = { name: "New Name", estimatedTime: 15 };
            const result = await serviceService.update(1, input);

            expect(mockServiceRepository.findById).toHaveBeenCalledWith(1, ["desks"]);
            expect(mockServiceRepository.findByName).toHaveBeenCalledWith(input.name);
            expect(mockServiceRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: "New Name", estimatedTime: 15 }));
            expect(mockMapServiceDAOToDTO).toHaveBeenCalledWith(updatedServiceDAO); // Ora usiamo il nostro mock
            expect(result).toEqual({ id: 1, name: "New Name", estimatedTime: 15, desks: [] });
        });

        test("should update service desks and return updated DTO", async () => {
            const existingService = { ...mockServiceDAO1, desks: [mockDeskDAO1] };
            const updatedServiceDAO = { ...existingService, desks: [mockDeskDAO2] };
            mockServiceRepository.findById.mockResolvedValue(existingService);
            mockServiceRepository.findDesksByIds.mockResolvedValue([mockDeskDAO2]);
            mockServiceRepository.save.mockResolvedValue(updatedServiceDAO);

            const input = { deskIds: [mockDeskDAO2.id] };
            const result = await serviceService.update(1, input);

            expect(mockServiceRepository.findById).toHaveBeenCalledWith(1, ["desks"]);
            expect(mockServiceRepository.findDesksByIds).toHaveBeenCalledWith(input.deskIds);
            expect(mockServiceRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                id: 1,
                desks: [mockDeskDAO2]
            }));
            expect(mockMapServiceDAOToDTO).toHaveBeenCalledWith(updatedServiceDAO); // Ora usiamo il nostro mock
            expect(result).toEqual({
                id: 1,
                name: "Service A",
                estimatedTime: 10,
                desks: [{ id: mockDeskDAO2.id, name: mockDeskDAO2.name }]
            });
        });

        test("should remove all desks if deskIds is an empty array", async () => {
            const existingService = { ...mockServiceWithDesksDAO };
            const updatedServiceDAO = { ...existingService, desks: [] };
            mockServiceRepository.findById.mockResolvedValue(existingService);
            mockServiceRepository.save.mockResolvedValue(updatedServiceDAO);

            const input = { deskIds: [] };
            const result = await serviceService.update(3, input);

            expect(mockServiceRepository.findById).toHaveBeenCalledWith(3, ["desks"]);
            expect(mockServiceRepository.findDesksByIds).not.toHaveBeenCalled(); // Nessuna chiamata se []
            expect(mockServiceRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                id: 3,
                desks: []
            }));
            expect(mockMapServiceDAOToDTO).toHaveBeenCalledWith(updatedServiceDAO); // Ora usiamo il nostro mock
            expect(result).toEqual({ id: 3, name: "Service C", estimatedTime: 30, desks: [] });
        });

        test("should handle null deskIds (remove all desks)", async () => { // Comportamento come per DeskService
            const existingService = { ...mockServiceWithDesksDAO };
            const updatedServiceDAO = { ...existingService, desks: [] };
            mockServiceRepository.findById.mockResolvedValue(existingService);
            mockServiceRepository.save.mockResolvedValue(updatedServiceDAO);

            const input = { deskIds: null };
            const result = await serviceService.update(3, input);

            expect(mockServiceRepository.findById).toHaveBeenCalledWith(3, ["desks"]);
            expect(mockServiceRepository.findDesksByIds).not.toHaveBeenCalled();
            expect(mockServiceRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                id: 3,
                desks: [],
            }));
            expect(mockMapServiceDAOToDTO).toHaveBeenCalledWith(updatedServiceDAO); // Ora usiamo il nostro mock
            expect(result).toEqual({ id: 3, name: "Service C", estimatedTime: 30, desks: [] });
        });


        test("should pass relations to findById for update", async () => {
            const existingService = { ...mockServiceDAO1, name: "Old Name" };
            const updatedServiceDAO = { ...existingService, name: "New Name" };
            mockServiceRepository.findById.mockResolvedValue(existingService);
            mockServiceRepository.findByName.mockResolvedValue(null);
            mockServiceRepository.save.mockResolvedValue(updatedServiceDAO);

            const input = { name: "New Name" };
            const result = await serviceService.update(1, input, ["tickets"]); // Aggiungi relazioni

            expect(mockServiceRepository.findById).toHaveBeenCalledWith(1, ["desks", "tickets"]); // Deve includere "desks" e le nuove relazioni
            expect(result).toEqual({ id: 1, name: "New Name", estimatedTime: 10, desks: [] });
        });

        test("should throw NotFoundError if service to update not found", async () => {
            mockServiceRepository.findById.mockResolvedValue(null);

            await expect(serviceService.update(99, { name: "NonExistent" })).rejects.toThrow(NotFoundError);
            await expect(serviceService.update(99, { name: "NonExistent" })).rejects.toThrow("Service with ID 99 not found");
        });

        test("should throw DUPLICATE_NAME error if updating to an existing service name", async () => {
            const existingService = { ...mockServiceDAO1, id: 1, name: "Service A" };
            const otherService = { ...mockServiceDAO2, id: 2, name: "Service B" };

            mockServiceRepository.findById.mockResolvedValue(existingService);
            mockServiceRepository.findByName.mockResolvedValue(otherService); // Trova un servizio con lo stesso nome

            const input = { name: "Service B" }; // Il nome di un servizio esistente
            await expect(serviceService.update(1, input)).rejects.toEqual(
                expect.objectContaining({
                    message: "Service name must be unique",
                    code: "DUPLICATE_NAME",
                })
            );
            expect(mockServiceRepository.save).not.toHaveBeenCalled();
        });

        test("should not call findByName or throw error if name is not changed", async () => {
            const existingService = { ...mockServiceDAO1, id: 1, name: "Service A" };
            mockServiceRepository.findById.mockResolvedValue(existingService);
            mockServiceRepository.findByName.mockResolvedValue(null); // Non dovrebbe essere chiamato
            mockServiceRepository.save.mockResolvedValue(existingService);

            const input = { name: "Service A" }; // Il nome non cambia
            const result = await serviceService.update(1, input);

            expect(mockServiceRepository.findById).toHaveBeenCalledWith(1, ["desks"]);
            expect(mockServiceRepository.findByName).not.toHaveBeenCalled();
            expect(mockServiceRepository.save).toHaveBeenCalledWith(existingService);
            expect(mockMapServiceDAOToDTO).toHaveBeenCalledWith(existingService); // Ora usiamo il nostro mock
            expect(result).toEqual({ id: 1, name: "Service A", estimatedTime: 10, desks: [] });
        });
    });

    // ---------- TEST: remove ----------
    describe("remove", () => {
        test("should delete a service by ID", async () => {
            mockServiceRepository.delete.mockResolvedValue({ affected: 1, raw: [] }); // Include raw

            await serviceService.remove(1);

            expect(mockServiceRepository.delete).toHaveBeenCalledWith(1);
        });

        test("should throw NotFoundError if service to remove not found", async () => {
            mockServiceRepository.delete.mockResolvedValue({ affected: 0, raw: [] }); // Include raw

            await expect(serviceService.remove(99)).rejects.toThrow(NotFoundError);
            await expect(serviceService.remove(99)).rejects.toThrow("Service with ID 99 not found");
        });
    });
});