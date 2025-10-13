import { In } from "typeorm";
import { AppDataSource } from "../../data-source";
import { ServiceDAO } from "../../models/DAO/ServiceDAO";
import { ServiceRepository } from "../../repositories/ServiceRepository";
import { DeskDAO } from "../../models/DAO/DeskDAO"; // Importa DeskDAO per i tipi nei mock

// Mock di tutto ciò che proviene da TypeORM e dal datasource
// Assicurati che questi mock siano coerenti con quelli globali o definiti nel setupFilesAfterEnv
jest.mock("typeorm", () => {
    const original = jest.requireActual("typeorm");
    return {
        ...original,
        In: jest.fn((x) => x), // Mantieni questo se lo usi nei repository
        Repository: jest.fn().mockImplementation(() => ({
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
        })),
    };
});

jest.mock("../../data-source", () => {
    const mockGetRepository = jest.fn();
    return {
        AppDataSource: {
            getRepository: mockGetRepository,
        },
    };
});

describe("ServiceRepository", () => {
    let repo: ServiceRepository;
    let mockServiceORMRepo: any; // Il repository effettivo per ServiceDAO
    let mockDeskORMRepo: any; // Il repository effettivo per DeskDAO

    beforeEach(() => {
        mockServiceORMRepo = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
        };

        mockDeskORMRepo = {
            find: jest.fn(),
        };

        // Assicurati che AppDataSource.getRepository restituisca i mock nell'ordine corretto
        // Il primo .getRepository(ServiceDAO) restituirà mockServiceORMRepo
        // Il secondo .getRepository(DeskDAO) restituirà mockDeskORMRepo
        (AppDataSource.getRepository as jest.Mock)
            .mockImplementation((entity) => {
                if (entity === ServiceDAO) {
                    return mockServiceORMRepo;
                }
                if (entity === DeskDAO) {
                    return mockDeskORMRepo;
                }
                return new Error("Unexpected DAO entity");
            });

        repo = new ServiceRepository();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ---------- TEST: findAll ----------
    test("findAll() should call repo.find with correct relations and order", async () => {
        const services = [{ id: 1, name: "Service A" }];
        mockServiceORMRepo.find.mockResolvedValue(services);

        const result = await repo.findAll(["desks"]);

        expect(mockServiceORMRepo.find).toHaveBeenCalledWith({
            relations: {
                desks: true,
                tickets: false,
            },
            order: { id: "ASC" },
        });
        expect(result).toEqual(services);
    });

    test("findAll() should handle no relations", async () => {
        const services = [{ id: 1, name: "Service A" }];
        mockServiceORMRepo.find.mockResolvedValue(services);

        const result = await repo.findAll(); // Senza relazioni

        expect(mockServiceORMRepo.find).toHaveBeenCalledWith({
            relations: {
                desks: false,
                tickets: false,
            },
            order: { id: "ASC" },
        });
        expect(result).toEqual(services);
    });

    // ---------- TEST: findById ----------
    test("findById() should call repo.findOne with id and relations", async () => {
        const service = { id: 5, name: "Service B" };
        mockServiceORMRepo.findOne.mockResolvedValue(service);

        const result = await repo.findById(5, ["tickets"]);

        expect(mockServiceORMRepo.findOne).toHaveBeenCalledWith({
            where: { id: 5 },
            relations: {
                desks: false,
                tickets: true,
            },
        });
        expect(result).toEqual(service);
    });

    // ---------- TEST: findByName ----------
    test("findByName() should call repo.findOne with name", async () => {
        const service = { id: 3, name: "Service C" };
        mockServiceORMRepo.findOne.mockResolvedValue(service);

        const result = await repo.findByName("Service C");

        expect(mockServiceORMRepo.findOne).toHaveBeenCalledWith({
            where: { name: "Service C" },
        });
        expect(result).toEqual(service);
    });

    // ---------- TEST: findByDeskId ----------
    test("findByDeskId() should build query with joins and return result", async () => {
        const fakeQueryBuilder = {
            innerJoin: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([{ id: 1, name: "Service D" }]),
        };
        mockServiceORMRepo.createQueryBuilder.mockReturnValue(fakeQueryBuilder);

        const result = await repo.findByDeskId(10, ["desks", "tickets"]);

        expect(mockServiceORMRepo.createQueryBuilder).toHaveBeenCalledWith("service");
        expect(fakeQueryBuilder.innerJoin).toHaveBeenCalledWith(
            "service.desks",
            "desk",
            "desk.id = :deskId",
            { deskId: 10 }
        );
        expect(fakeQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith("service.desks", "d");
        expect(fakeQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith("service.tickets", "t");
        expect(fakeQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(2);
        expect(fakeQueryBuilder.getMany).toHaveBeenCalled();
        expect(result).toEqual([{ id: 1, name: "Service D" }]);
    });

    test("findByDeskId() should build query without optional joins if relations not specified", async () => {
        const fakeQueryBuilder = {
            innerJoin: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([{ id: 1, name: "Service D" }]),
        };
        mockServiceORMRepo.createQueryBuilder.mockReturnValue(fakeQueryBuilder);

        const result = await repo.findByDeskId(10); // Senza relazioni

        expect(mockServiceORMRepo.createQueryBuilder).toHaveBeenCalledWith("service");
        expect(fakeQueryBuilder.innerJoin).toHaveBeenCalledWith(
            "service.desks",
            "desk",
            "desk.id = :deskId",
            { deskId: 10 }
        );
        expect(fakeQueryBuilder.leftJoinAndSelect).not.toHaveBeenCalled(); // Nessuna join opzionale
        expect(fakeQueryBuilder.getMany).toHaveBeenCalled();
        expect(result).toEqual([{ id: 1, name: "Service D" }]);
    });


    // ---------- TEST: findDesksByIds ----------
    test("findDesksByIds() should call deskRepo.find with ids", async () => {
        const ids = [1, 2, 3];
        const desks = [{ id: 1, name: "Desk X" }];
        mockDeskORMRepo.find.mockResolvedValue(desks);

        const result = await repo.findDesksByIds(ids);

        expect(mockDeskORMRepo.find).toHaveBeenCalledWith({
            where: { id: In(ids) },
        });
        expect(result).toEqual(desks);
    });

    test("findDesksByIds() should return empty array if no ids are provided", async () => {
        const ids: number[] = [];
        const result = await repo.findDesksByIds(ids);

        expect(mockDeskORMRepo.find).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    // ---------- TEST: save ----------
    test("save() should call repo.save with entity", async () => {
        const entity = { id: 7, name: "New Service" };
        mockServiceORMRepo.save.mockResolvedValue(entity);

        const result = await repo.save(entity as ServiceDAO);

        expect(mockServiceORMRepo.save).toHaveBeenCalledWith(entity);
        expect(result).toEqual(entity);
    });

    // ---------- TEST: delete ----------
    test("delete() should call repo.delete with id", async () => {
        mockServiceORMRepo.delete.mockResolvedValue({ affected: 1 });

        const result = await repo.delete(9);

        expect(mockServiceORMRepo.delete).toHaveBeenCalledWith(9);
        expect(result).toEqual({ affected: 1 });
    });
});