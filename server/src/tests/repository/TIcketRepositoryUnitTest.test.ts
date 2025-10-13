import { In, Repository } from "typeorm";
import { AppDataSource } from "../../data-source";
import { TicketDAO } from "../../models/DAO/TicketDAO";
import { ServiceDAO } from "../../models/DAO/ServiceDAO";
import { DeskDAO } from "../../models/DAO/DeskDAO";
import { TicketRepository } from "../../repositories/TicketRepository";
import { StatusType } from "../../models/StatusType"; // Assicurati che questo import sia corretto per il tipo

// I mock per typeorm e AppDataSource dovrebbero essere gestiti globalmente
// o in un setup.ts, ma li includo qui per completezza se non lo fossero.
jest.mock("typeorm", () => {
    const original = jest.requireActual("typeorm");
    return {
        ...original,
        In: jest.fn((x) => x),
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

describe("TicketRepository", () => {
    let repo: TicketRepository;
    let mockTicketORMRepo: any;
    let mockServiceORMRepo: any;
    let mockDeskORMRepo: any;

    beforeEach(() => {
        // Inizializza i mock per i repository TypeORM
        mockTicketORMRepo = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
        };
        mockServiceORMRepo = {
            find: jest.fn(),
            findOne: jest.fn(),
        };
        mockDeskORMRepo = {
            findOne: jest.fn(),
        };

        // Configura AppDataSource.getRepository per restituire i mock corretti
        (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
            if (entity === TicketDAO) return mockTicketORMRepo;
            if (entity === ServiceDAO) return mockServiceORMRepo;
            if (entity === DeskDAO) return mockDeskORMRepo;
            return new Error(`Unexpected DAO entity: ${entity}`);
        });

        repo = new TicketRepository();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Mock per QueryBuilder per semplificare i test che usano createQueryBuilder
    const mockQueryBuilder = () => ({
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
    });

    // ---------- TEST: findAll ----------
    test("findAll() should call repo.createQueryBuilder and apply relations", async () => {
        const tickets = [{ id: 1, status: "OPEN" as StatusType }];
        const qb = mockQueryBuilder();
        qb.getMany.mockResolvedValue(tickets);
        mockTicketORMRepo.createQueryBuilder.mockReturnValue(qb);

        const result = await repo.findAll(["service", "managedBy"]);

        expect(mockTicketORMRepo.createQueryBuilder).toHaveBeenCalledWith("ticket");
        expect(qb.leftJoinAndSelect).toHaveBeenCalledWith("ticket.service", "service");
        expect(qb.leftJoinAndSelect).toHaveBeenCalledWith("ticket.managedBy", "desk");
        expect(qb.getMany).toHaveBeenCalled();
        expect(result).toEqual(tickets);
    });

    test("findAll() should call repo.createQueryBuilder without relations", async () => {
        const tickets = [{ id: 1, status: "OPEN" as StatusType }];
        const qb = mockQueryBuilder();
        qb.getMany.mockResolvedValue(tickets);
        mockTicketORMRepo.createQueryBuilder.mockReturnValue(qb);

        const result = await repo.findAll();

        expect(mockTicketORMRepo.createQueryBuilder).toHaveBeenCalledWith("ticket");
        expect(qb.leftJoinAndSelect).not.toHaveBeenCalled();
        expect(qb.getMany).toHaveBeenCalled();
        expect(result).toEqual(tickets);
    });

    // ---------- TEST: findById ----------
    test("findById() should call repo.createQueryBuilder with id and apply relations", async () => {
        const ticket = { id: 1, status: "OPEN" as StatusType };
        const qb = mockQueryBuilder();
        qb.getOne.mockResolvedValue(ticket);
        mockTicketORMRepo.createQueryBuilder.mockReturnValue(qb);

        const result = await repo.findById(1, ["service"]);

        expect(mockTicketORMRepo.createQueryBuilder).toHaveBeenCalledWith("ticket");
        expect(qb.where).toHaveBeenCalledWith("ticket.id = :id", { id: 1 });
        expect(qb.leftJoinAndSelect).toHaveBeenCalledWith("ticket.service", "service");
        expect(qb.getOne).toHaveBeenCalled();
        expect(result).toEqual(ticket);
    });

    // ---------- TEST: findByServiceId ----------
    test("findByServiceId() should call query builder with inner join on service and apply relations", async () => {
        const tickets = [{ id: 1, status: "OPEN" as StatusType }];
        const qb = mockQueryBuilder();
        qb.getMany.mockResolvedValue(tickets);
        mockTicketORMRepo.createQueryBuilder.mockReturnValue(qb);

        const result = await repo.findByServiceId(10, ["managedBy"]);

        expect(mockTicketORMRepo.createQueryBuilder).toHaveBeenCalledWith("ticket");
        expect(qb.innerJoin).toHaveBeenCalledWith("ticket.service", "svc", "svc.id = :serviceId", { serviceId: 10 });
        expect(qb.leftJoinAndSelect).toHaveBeenCalledWith("ticket.managedBy", "desk");
        expect(qb.getMany).toHaveBeenCalled();
        expect(result).toEqual(tickets);
    });

    // ---------- TEST: findByDeskId ----------
    test("findByDeskId() should call query builder with inner join on desk and apply relations", async () => {
        const tickets = [{ id: 1, status: "OPEN" as StatusType }];
        const qb = mockQueryBuilder();
        qb.getMany.mockResolvedValue(tickets);
        mockTicketORMRepo.createQueryBuilder.mockReturnValue(qb);

        const result = await repo.findByDeskId(20, ["service"]);

        expect(mockTicketORMRepo.createQueryBuilder).toHaveBeenCalledWith("ticket");
        expect(qb.innerJoin).toHaveBeenCalledWith("ticket.managedBy", "desk", "desk.id = :deskId", { deskId: 20 });
        expect(qb.leftJoinAndSelect).toHaveBeenCalledWith("ticket.service", "service");
        expect(qb.getMany).toHaveBeenCalled();
        expect(result).toEqual(tickets);
    });

    // ---------- TEST: findByServiceIdStatus ----------
    test("findByServiceIdStatus() should call query builder with serviceId and status and apply relations", async () => {
        const tickets = [{ id: 1, status: "IN_PROGRESS" as StatusType }];
        const qb = mockQueryBuilder();
        qb.getMany.mockResolvedValue(tickets);
        mockTicketORMRepo.createQueryBuilder.mockReturnValue(qb);

        const result = await repo.findByServiceIdStatus(10, "IN_PROGRESS" as StatusType, ["managedBy"]);

        expect(mockTicketORMRepo.createQueryBuilder).toHaveBeenCalledWith("ticket");
        expect(qb.innerJoin).toHaveBeenCalledWith("ticket.service", "svc", "svc.id = :serviceId", { serviceId: 10 });
        expect(qb.where).toHaveBeenCalledWith("ticket.status = :status", { status: "IN_PROGRESS" as StatusType });
        expect(qb.leftJoinAndSelect).toHaveBeenCalledWith("ticket.managedBy", "desk");
        expect(qb.getMany).toHaveBeenCalled();
        expect(result).toEqual(tickets);
    });

    // ---------- TEST: findServicesByIds ----------
    test("findServicesByIds() should call serviceRepo.find with ids", async () => {
        const ids = [1, 2, 3];
        const services = [{ id: 1, name: "Service A" }];
        mockServiceORMRepo.find.mockResolvedValue(services);

        const result = await repo.findServicesByIds(ids);

        expect(mockServiceORMRepo.find).toHaveBeenCalledWith({ where: { id: In(ids) } });
        expect(result).toEqual(services);
    });

    test("findServicesByIds() should return empty array if no ids", async () => {
        const result = await repo.findServicesByIds([]);
        expect(mockServiceORMRepo.find).not.toHaveBeenCalled();
        expect(result).toEqual([]);
    });

    // ---------- TEST: findServiceById ----------
    test("findServiceById() should call serviceRepo.findOne with id", async () => {
        const service = { id: 1, name: "Service A" };
        mockServiceORMRepo.findOne.mockResolvedValue(service);

        const result = await repo.findServiceById(1);

        expect(mockServiceORMRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(service);
    });

    // ---------- TEST: findDeskById ----------
    test("findDeskById() should call deskRepo.findOne with id", async () => {
        const desk = { id: 1, name: "Desk A" };
        mockDeskORMRepo.findOne.mockResolvedValue(desk);

        const result = await repo.findDeskById(1);

        expect(mockDeskORMRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(result).toEqual(desk);
    });

    // ---------- TEST: save ----------
    test("save() should call repo.save with entity", async () => {
        const entity = { id: 1, status: "OPEN" as StatusType };
        mockTicketORMRepo.save.mockResolvedValue(entity);

        const result = await repo.save(entity as TicketDAO);

        expect(mockTicketORMRepo.save).toHaveBeenCalledWith(entity);
        expect(result).toEqual(entity);
    });

    // ---------- TEST: updateStatus ----------
    test("updateStatus() should find, update status, and save the ticket", async () => {
        const ticket = { id: 1, status: "OPEN" as StatusType };
        mockTicketORMRepo.findOne.mockResolvedValue(ticket);
        const updatedTicket = { ...ticket, status: "CLOSED" as StatusType };
        mockTicketORMRepo.save.mockResolvedValue(updatedTicket);

        const result = await repo.updateStatus(1, "CLOSED" as StatusType);

        expect(mockTicketORMRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockTicketORMRepo.save).toHaveBeenCalledWith(updatedTicket);
        expect(result).toEqual(updatedTicket);
    });

    test("updateStatus() should return null if ticket not found", async () => {
        mockTicketORMRepo.findOne.mockResolvedValue(null);

        const result = await repo.updateStatus(99, "CLOSED" as StatusType);

        expect(mockTicketORMRepo.findOne).toHaveBeenCalledWith({ where: { id: 99 } });
        expect(mockTicketORMRepo.save).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });

    // ---------- TEST: delete ----------
    test("delete() should call repo.delete with id and return true if affected", async () => {
        mockTicketORMRepo.delete.mockResolvedValue({ affected: 1 });

        const result = await repo.delete(9);

        expect(mockTicketORMRepo.delete).toHaveBeenCalledWith(9);
        expect(result).toBe(true);
    });

    test("delete() should return false if no rows affected", async () => {
        mockTicketORMRepo.delete.mockResolvedValue({ affected: 0 });

        const result = await repo.delete(9);

        expect(mockTicketORMRepo.delete).toHaveBeenCalledWith(9);
        expect(result).toBe(false);
    });
});