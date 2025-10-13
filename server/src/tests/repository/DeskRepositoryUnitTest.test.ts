import { In } from "typeorm";
import { DeskRepository } from "../../repositories/DeskRepository";
import { DeskDAO } from "../../models/DAO/DeskDAO";
import { ServiceDAO } from "../../models/DAO/ServiceDAO";
import { AppDataSource } from "../../data-source";

// ✅ Mock di tutto ciò che proviene da TypeORM e dal datasource
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

describe("DeskRepository", () => {
  let repo: DeskRepository;
  let mockDeskRepo: any;
  let mockServiceRepo: any;

  beforeEach(() => {
    // Mock separati per i due repository
    mockDeskRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockServiceRepo = {
      find: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock)
      .mockImplementationOnce(() => mockDeskRepo)
      .mockImplementationOnce(() => mockServiceRepo);

    repo = new DeskRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------- TEST: findAll ----------
  test("findAll() should call repo.find with relations", async () => {
    const desks = [{ id: 1 }];
    mockDeskRepo.find.mockResolvedValue(desks);

    const result = await repo.findAll(["services"]);
    expect(mockDeskRepo.find).toHaveBeenCalledWith({ relations: ["services"] });
    expect(result).toEqual(desks);
  });

  // ---------- TEST: findById ----------
  test("findById() should call repo.findOne with id and relations", async () => {
    const desk = { id: 5 };
    mockDeskRepo.findOne.mockResolvedValue(desk);

    const result = await repo.findById(5, ["tickets"]);
    expect(mockDeskRepo.findOne).toHaveBeenCalledWith({
      where: { id: 5 },
      relations: ["tickets"],
    });
    expect(result).toEqual(desk);
  });

  // ---------- TEST: findByName ----------
  test("findByName() should call repo.findOne with name and relations", async () => {
    const desk = { id: 3, name: "Desk A" };
    mockDeskRepo.findOne.mockResolvedValue(desk);

    const result = await repo.findByName("Desk A");
    expect(mockDeskRepo.findOne).toHaveBeenCalledWith({
      where: { name: "Desk A" },
      relations: [],
    });
    expect(result).toEqual(desk);
  });

  // ---------- TEST: findByServiceId ----------
  test("findByServiceId() should build query with joins and return result", async () => {
    const fakeQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 1 }]),
    };

    mockDeskRepo.createQueryBuilder.mockReturnValue(fakeQueryBuilder);

    const result = await repo.findByServiceId(10, ["services", "tickets"]);
    expect(fakeQueryBuilder.innerJoin).toHaveBeenCalledWith(
      "desk.services",
      "service",
      "service.id = :serviceId",
      { serviceId: 10 }
    );
    expect(fakeQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(2);
    expect(fakeQueryBuilder.getMany).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1 }]);
  });

  // ---------- TEST: findServicesByIds ----------
  test("findServicesByIds() should call serviceRepo.find with ids", async () => {
    const ids = [1, 2, 3];
    const services = [{ id: 1 }];
    mockServiceRepo.find.mockResolvedValue(services);

    const result = await repo.findServicesByIds(ids);
    expect(mockServiceRepo.find).toHaveBeenCalledWith({
      where: { id: ids },
    });
    expect(result).toEqual(services);
  });

  // ---------- TEST: save ----------
  test("save() should call repo.save with entity", async () => {
    const entity = { id: 7 };
    mockDeskRepo.save.mockResolvedValue(entity);

    const result = await repo.save(entity as any);
    expect(mockDeskRepo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(entity);
  });

  // ---------- TEST: delete ----------
  test("delete() should call repo.delete with id", async () => {
    mockDeskRepo.delete.mockResolvedValue({ affected: 1 });

    const result = await repo.delete(9);
    expect(mockDeskRepo.delete).toHaveBeenCalledWith(9);
    expect(result).toEqual({ affected: 1 });
  });
});
