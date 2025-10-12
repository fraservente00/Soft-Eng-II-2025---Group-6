import { In, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { ServiceDAO } from "../models/DAO/ServiceDAO";
import { DeskDAO } from "../models/DAO/DeskDAO";

export type ServiceRelations = Array<"desks" | "tickets">;

export class ServiceRepository {
  private repo: Repository<ServiceDAO>;
  private deskRepo: Repository<DeskDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(ServiceDAO);
    this.deskRepo = AppDataSource.getRepository(DeskDAO);
  }

  findAll(relations: ServiceRelations = []): Promise<ServiceDAO[]> {
    return this.repo.find({
      relations: {
        desks: relations.includes("desks"),
        tickets: relations.includes("tickets"),
      },
      order: { id: "ASC" },
    });
  }

  findById(id: number, relations: ServiceRelations = []): Promise<ServiceDAO | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        desks: relations.includes("desks"),
        tickets: relations.includes("tickets"),
      },
    });
  }

  /** M:N helper: services handled by a given desk */
  findByDeskId(deskId: number, relations: ServiceRelations = []): Promise<ServiceDAO[]> {
    const qb = this.repo
        .createQueryBuilder("service")
        .innerJoin("service.desks", "desk", "desk.id = :deskId", { deskId });

    if (relations.includes("desks")) {
      qb.leftJoinAndSelect("service.desks", "d");
    }
    if (relations.includes("tickets")) {
      qb.leftJoinAndSelect("service.tickets", "t");
    }

    return qb.getMany();
  }

  /** Unique name lookup for validation */
  findByName(name: string): Promise<ServiceDAO | null> {
    return this.repo.findOne({ where: { name } });
  }

  /** Load many desks by ids (ignore missing) */
  findDesksByIds(ids: number[]): Promise<DeskDAO[]> {
    if (!ids.length) return Promise.resolve([]);
    return this.deskRepo.find({ where: { id: In(ids) } });
  }

  save(entity: ServiceDAO): Promise<ServiceDAO> {
    return this.repo.save(entity);
  }

  delete(id: number) {
    return this.repo.delete(id);
  }
}
