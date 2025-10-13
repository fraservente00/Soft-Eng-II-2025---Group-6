import { DeskService } from "../../../services/DeskService";
import { DeskRepository } from "../../../repositories/DeskRepository";
import { NotFoundError } from "../../../models/errors/NotFoundError";
import { mapDeskDAOToDTO } from "../../../services/mapperService";
import { AppDataSource } from "../../../data-source";
import { DeskDAO } from "../../../models/DAO/DeskDAO";
import { ServiceDAO } from "../../../models/DAO/ServiceDAO";
import { Desk } from "../../../models/DTO/Desk";

// Mock del DeskRepository
jest.mock("../../../repositories/DeskRepository");
// Mock del mapper (sebbene mapDeskDAOToDTO sia testata altrove, qui ci assicuriamo che funzioni come atteso)
jest.mock("../../../services/mapperService", () => ({
    mapDeskDAOToDTO: jest.fn((dao, _index, _array) => ({
    id: dao.id,
    name: dao.name,
    services: dao.services?.map((s: any) => ({ id: s.id, name: s.name })), // Ho messo any per i service per semplicità nel mock
  })),
}));
// Mock di AppDataSource per le transazioni
jest.mock("../../../data-source", () => ({
    AppDataSource: {
        transaction: jest.fn((callback) => callback()), // Simula l'esecuzione immediata della transazione
    },
}));


describe("DeskService", () => {
    let deskService: DeskService;
    let mockDeskRepository: jest.Mocked<DeskRepository>;

    // Dati di esempio
    const mockDeskDAO1 = new DeskDAO();
    mockDeskDAO1.id = 1;
    mockDeskDAO1.name = "Desk 1";
    mockDeskDAO1.services = [];

    const mockDeskDAO2 = new DeskDAO();
    mockDeskDAO2.id = 2;
    mockDeskDAO2.name = "Desk 2";
    mockDeskDAO2.services = [];

    const mockServiceDAO1 = new ServiceDAO();
    mockServiceDAO1.id = 10;
    mockServiceDAO1.name = "Service A";
    mockServiceDAO1.estimatedTime = 15;

    const mockServiceDAO2 = new ServiceDAO();
    mockServiceDAO2.id = 20;
    mockServiceDAO2.name = "Service B";
    mockServiceDAO2.estimatedTime = 30;

    const mockDeskWithServicesDAO = new DeskDAO();
    mockDeskWithServicesDAO.id = 3;
    mockDeskWithServicesDAO.name = "Desk 3";
    mockDeskWithServicesDAO.services = [mockServiceDAO1];


    beforeEach(() => {
        // Ogni test deve avere un'istanza pulita del servizio e del repository mockato
        jest.clearAllMocks();
        deskService = new DeskService();
        // Ottieni il riferimento al mock del repository
        mockDeskRepository = (DeskRepository as jest.Mock).mock.instances[0];
    });

    // ---------- TEST: list ----------
    describe("list", () => {
        test("should return all desks mapped to DTOs", async () => {
            mockDeskRepository.findAll.mockResolvedValue([mockDeskDAO1, mockDeskDAO2]);

            const result = await deskService.list();

            expect(mockDeskRepository.findAll).toHaveBeenCalledWith([]);
            expect(mapDeskDAOToDTO).toHaveBeenCalledTimes(2);

            // Verifichiamo la prima chiamata
            expect(mapDeskDAOToDTO).toHaveBeenCalledWith(mockDeskDAO1, 0, [mockDeskDAO1, mockDeskDAO2]);
            // Verifichiamo la seconda chiamata
            expect(mapDeskDAOToDTO).toHaveBeenCalledWith(mockDeskDAO2, 1, [mockDeskDAO1, mockDeskDAO2]);

            expect(result).toEqual([
                { id: 1, name: "Desk 1", services: [] },
                { id: 2, name: "Desk 2", services: [] },
            ]);
        });

        test("should pass relations to findAll", async () => {
            mockDeskRepository.findAll.mockResolvedValue([mockDeskWithServicesDAO]);

            const result = await deskService.list(["services"]);

            expect(mockDeskRepository.findAll).toHaveBeenCalledWith(["services"]);
            expect(mapDeskDAOToDTO).toHaveBeenCalledTimes(1);
            expect(result).toEqual([{
                id: 3,
                name: "Desk 3",
                services: [{ id: mockServiceDAO1.id, name: mockServiceDAO1.name }]
            }]);
        });
    });

    // ---------- TEST: get ----------
    describe("get", () => {
        test("should return a single desk mapped to DTO by ID", async () => {
            mockDeskRepository.findById.mockResolvedValue(mockDeskDAO1);

            const result = await deskService.get(1);

            expect(mockDeskRepository.findById).toHaveBeenCalledWith(1, []);
            expect(mapDeskDAOToDTO).toHaveBeenCalledWith(mockDeskDAO1);
            expect(result).toEqual({ id: 1, name: "Desk 1", services: [] });
        });

        test("should throw NotFoundError if desk not found", async () => {
            mockDeskRepository.findById.mockResolvedValue(null);

            await expect(deskService.get(99)).rejects.toThrow(NotFoundError);
            await expect(deskService.get(99)).rejects.toThrow("Desk with ID 99 not found");
        });

        test("should pass relations to findById", async () => {
            mockDeskRepository.findById.mockResolvedValue(mockDeskWithServicesDAO);

            const result = await deskService.get(3, ["services"]);

            expect(mockDeskRepository.findById).toHaveBeenCalledWith(3, ["services"]);
            expect(mapDeskDAOToDTO).toHaveBeenCalledWith(mockDeskWithServicesDAO);
            expect(result).toEqual({
                id: 3,
                name: "Desk 3",
                services: [{ id: mockServiceDAO1.id, name: mockServiceDAO1.name }]
            });
        });
    });

    // ---------- TEST: listByService ----------
    describe("listByService", () => {
        test("should return desks for a given service ID mapped to DTOs", async () => {
            mockDeskRepository.findByServiceId.mockResolvedValue([mockDeskDAO1]);

            const result = await deskService.listByService(10);

            expect(mockDeskRepository.findByServiceId).toHaveBeenCalledWith(10, []);
            // Verifica che mapDeskDAOToDTO sia stato chiamato una sola volta
            expect(mapDeskDAOToDTO).toHaveBeenCalledTimes(1);
            // Verifica che la prima (e unica) chiamata sia stata con mockDeskDAO1
            expect(mapDeskDAOToDTO).toHaveBeenCalledWith(mockDeskDAO1, 0, [mockDeskDAO1]);
            expect(result).toEqual([{ id: 1, name: "Desk 1", services: [] }]);
        });

        test("should pass relations to findByServiceId", async () => {
            mockDeskRepository.findByServiceId.mockResolvedValue([mockDeskWithServicesDAO]);

            const result = await deskService.listByService(mockServiceDAO1.id, ["services"]);

            expect(mockDeskRepository.findByServiceId).toHaveBeenCalledWith(mockServiceDAO1.id, ["services"]);
            expect(mapDeskDAOToDTO).toHaveBeenCalledTimes(1);
            expect(result).toEqual([{
                id: 3,
                name: "Desk 3",
                services: [{ id: mockServiceDAO1.id, name: mockServiceDAO1.name }]
            }]);
        });
    });

    // ---------- TEST: create ----------
    describe("create", () => {
        test("should create a new desk and return its DTO", async () => {
            mockDeskRepository.findByName.mockResolvedValue(null); // Nessun nome duplicato
            mockDeskRepository.findServicesByIds.mockResolvedValue([mockServiceDAO1]); // Servizi trovati
            mockDeskRepository.save.mockResolvedValue(mockDeskWithServicesDAO); // Desk salvata

            const input = { name: "New Desk", serviceIds: [mockServiceDAO1.id] };
            const result = await deskService.create(input);

            expect(mockDeskRepository.findByName).toHaveBeenCalledWith(input.name);
            expect(AppDataSource.transaction).toHaveBeenCalled();
            expect(mockDeskRepository.findServicesByIds).toHaveBeenCalledWith(input.serviceIds);
            expect(mockDeskRepository.save).toHaveBeenCalledWith(expect.any(DeskDAO));
            const savedDeskDAO = (mockDeskRepository.save as jest.Mock).mock.calls[0][0];
            expect(savedDeskDAO.name).toBe(input.name);
            expect(savedDeskDAO.services).toEqual([mockServiceDAO1]);
            expect(mapDeskDAOToDTO).toHaveBeenCalledWith(mockDeskWithServicesDAO);
            expect(result).toEqual({
                id: 3,
                name: "Desk 3",
                services: [{ id: mockServiceDAO1.id, name: mockServiceDAO1.name }]
            });
        });

        test("should create a new desk without services", async () => {
            const deskDAOWithoutServices = { ...mockDeskDAO1, id: 4, name: "Desk No Services" };
            mockDeskRepository.findByName.mockResolvedValue(null);
            mockDeskRepository.save.mockResolvedValue(deskDAOWithoutServices);

            const input = { name: "Desk No Services" };
            const result = await deskService.create(input);

            expect(mockDeskRepository.findByName).toHaveBeenCalledWith(input.name);
            expect(AppDataSource.transaction).toHaveBeenCalled();
            expect(mockDeskRepository.findServicesByIds).not.toHaveBeenCalled();
            expect(mockDeskRepository.save).toHaveBeenCalledWith(expect.any(DeskDAO));
            const savedDeskDAO = (mockDeskRepository.save as jest.Mock).mock.calls[0][0];
            expect(savedDeskDAO.name).toBe(input.name);
            expect(savedDeskDAO.services).toBeUndefined(); // O [] a seconda dell'inizializzazione DAO
            expect(mapDeskDAOToDTO).toHaveBeenCalledWith(deskDAOWithoutServices);
            expect(result).toEqual({ id: 4, name: "Desk No Services", services: [] });
        });


        test("should throw DUPLICATE_NAME error if desk name already exists", async () => {
            mockDeskRepository.findByName.mockResolvedValue(mockDeskDAO1); // Nome duplicato

            const input = { name: "Desk 1" };
            await expect(deskService.create(input)).rejects.toEqual(
                expect.objectContaining({
                    message: "Desk name must be unique",
                    code: "DUPLICATE_NAME",
                })
            );
            expect(AppDataSource.transaction).not.toHaveBeenCalled(); // Non dovrebbe avviare la transazione
            expect(mockDeskRepository.save).not.toHaveBeenCalled();
        });
    });

    // ---------- TEST: update ----------
    describe("update", () => {
        test("should update desk name and return updated DTO", async () => {
            const existingDesk = { ...mockDeskDAO1, name: "Old Name" };
            const updatedDeskDAO = { ...existingDesk, name: "New Name" };
            mockDeskRepository.findById.mockResolvedValue(existingDesk);
            mockDeskRepository.findByName.mockResolvedValue(null); // Nessun nome duplicato
            mockDeskRepository.save.mockResolvedValue(updatedDeskDAO);

            const input = { name: "New Name" };
            const result = await deskService.update(1, input);

            expect(mockDeskRepository.findById).toHaveBeenCalledWith(1, ["services"]);
            expect(mockDeskRepository.findByName).toHaveBeenCalledWith(input.name);
            expect(mockDeskRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: "New Name" }));
            expect(mapDeskDAOToDTO).toHaveBeenCalledWith(updatedDeskDAO);
            expect(result).toEqual({ id: 1, name: "New Name", services: [] });
        });

        test("should update desk services and return updated DTO", async () => {
            const existingDesk = { ...mockDeskDAO1, services: [mockServiceDAO1] };
            const updatedDeskDAO = { ...existingDesk, services: [mockServiceDAO2] };
            mockDeskRepository.findById.mockResolvedValue(existingDesk);
            mockDeskRepository.findServicesByIds.mockResolvedValue([mockServiceDAO2]);
            mockDeskRepository.save.mockResolvedValue(updatedDeskDAO);

            const input = { serviceIds: [mockServiceDAO2.id] };
            const result = await deskService.update(1, input);

            expect(mockDeskRepository.findById).toHaveBeenCalledWith(1, ["services"]);
            expect(mockDeskRepository.findServicesByIds).toHaveBeenCalledWith(input.serviceIds);
            expect(mockDeskRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                id: 1,
                services: [mockServiceDAO2]
            }));
            expect(mapDeskDAOToDTO).toHaveBeenCalledWith(updatedDeskDAO);
            expect(result).toEqual({
                id: 1,
                name: "Desk 1",
                services: [{ id: mockServiceDAO2.id, name: mockServiceDAO2.name }]
            });
        });

        test("should remove all services if serviceIds is an empty array", async () => {
            const existingDesk = { ...mockDeskWithServicesDAO };
            const updatedDeskDAO = { ...existingDesk, services: [] };
            mockDeskRepository.findById.mockResolvedValue(existingDesk);
            mockDeskRepository.save.mockResolvedValue(updatedDeskDAO);

            const input = { serviceIds: [] };
            const result = await deskService.update(3, input);

            expect(mockDeskRepository.findById).toHaveBeenCalledWith(3, ["services"]);
            expect(mockDeskRepository.findServicesByIds).not.toHaveBeenCalled(); // Nessuna chiamata se []
            expect(mockDeskRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                id: 3,
                services: []
            }));
            expect(mapDeskDAOToDTO).toHaveBeenCalledWith(updatedDeskDAO);
            expect(result).toEqual({ id: 3, name: "Desk 3", services: [] });
        });

        test("should handle null serviceIds (remove all services)", async () => { // Rinomina il test per chiarezza
            const existingDesk = { ...mockDeskWithServicesDAO };
            const updatedDeskDAO = { ...existingDesk, services: [] }; // Mock del salvataggio con servizi vuoti
            mockDeskRepository.findById.mockResolvedValue(existingDesk);
            mockDeskRepository.save.mockResolvedValue(updatedDeskDAO);

            const input = { serviceIds: null };
            const result = await deskService.update(3, input);

            expect(mockDeskRepository.findById).toHaveBeenCalledWith(3, ["services"]);
            expect(mockDeskRepository.findServicesByIds).not.toHaveBeenCalled();
            expect(mockDeskRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                id: 3,
                services: [], // Ci aspettiamo servizi vuoti nel DAO
            }));
            expect(mapDeskDAOToDTO).toHaveBeenCalledWith(updatedDeskDAO);
            expect(result).toEqual({
                id: 3,
                name: "Desk 3",
                services: [] // <--- CAMBIA QUI
            });
        });


        test("should pass relations to findById for update", async () => {
            const existingDesk = { ...mockDeskDAO1, name: "Old Name" };
            const updatedDeskDAO = { ...existingDesk, name: "New Name" };
            mockDeskRepository.findById.mockResolvedValue(existingDesk);
            mockDeskRepository.findByName.mockResolvedValue(null);
            mockDeskRepository.save.mockResolvedValue(updatedDeskDAO);

            const input = { name: "New Name" };
            const result = await deskService.update(1, input, ["tickets"]); // Aggiungi relazioni

            expect(mockDeskRepository.findById).toHaveBeenCalledWith(1, ["services", "tickets"]); // Deve includere "services" e le nuove relazioni
            expect(result).toEqual({ id: 1, name: "New Name", services: [] });
        });

        test("should throw NotFoundError if desk to update not found", async () => {
            mockDeskRepository.findById.mockResolvedValue(null);

            await expect(deskService.update(99, { name: "NonExistent" })).rejects.toThrow(NotFoundError);
            await expect(deskService.update(99, { name: "NonExistent" })).rejects.toThrow("Desk with ID 99 not found");
        });

        test("should throw DUPLICATE_NAME error if updating to an existing desk name", async () => {
            const existingDesk = { ...mockDeskDAO1, id: 1, name: "Desk 1" };
            const otherDesk = { ...mockDeskDAO2, id: 2, name: "Desk 2" }; // Un'altra desk con un nome diverso

            mockDeskRepository.findById.mockResolvedValue(existingDesk);
            mockDeskRepository.findByName.mockResolvedValue(otherDesk); // Trova una desk con lo stesso nome

            const input = { name: "Desk 2" }; // Il nome della desk esistente
            await expect(deskService.update(1, input)).rejects.toEqual(
                expect.objectContaining({
                    message: "Desk name must be unique",
                    code: "DUPLICATE_NAME",
                })
            );
            expect(mockDeskRepository.save).not.toHaveBeenCalled();
        });

        test("should not call findByName or throw error if name is not changed", async () => { // Rinomina il test per chiarezza
            const existingDesk = { ...mockDeskDAO1, id: 1, name: "Desk 1" };
            mockDeskRepository.findById.mockResolvedValue(existingDesk);
            // mockiamo findByName come se non trovasse nulla, ma non dovrebbe essere chiamato
            mockDeskRepository.findByName.mockResolvedValue(null);
            mockDeskRepository.save.mockResolvedValue(existingDesk);

            const input = { name: "Desk 1" }; // Il nome non cambia
            const result = await deskService.update(1, input);

            expect(mockDeskRepository.findById).toHaveBeenCalledWith(1, ["services"]);
            expect(mockDeskRepository.findByName).not.toHaveBeenCalled(); // <--- VERIFICA CHE NON SIA STATO CHIAMATO
            expect(mockDeskRepository.save).toHaveBeenCalledWith(existingDesk);
            expect(mapDeskDAOToDTO).toHaveBeenCalledWith(existingDesk);
            expect(result).toEqual({ id: 1, name: "Desk 1", services: [] });
        });
    });

    // ---------- TEST: remove ----------
    describe("remove", () => {
        test("should delete a desk by ID", async () => {
            mockDeskRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

            await deskService.remove(1);

            expect(mockDeskRepository.delete).toHaveBeenCalledWith(1);
        });

        test("should throw NotFoundError if desk to remove not found", async () => {
            mockDeskRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

            await expect(deskService.remove(99)).rejects.toThrow(NotFoundError);
            await expect(deskService.remove(99)).rejects.toThrow("Desk with ID 99 not found");
        });
    });
});