import { In, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { DeskDAO } from "../models/DAO/DeskDAO";
import { ServiceDAO } from "../models/DAO/ServiceDAO";

export type DeskRelations = Array<"services" | "tickets">;

export class DeskRepository {
  private repo: Repository<DeskDAO>;
  private serviceRepo: Repository<ServiceDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(DeskDAO);
    this.serviceRepo = AppDataSource.getRepository(ServiceDAO);
  }

  findAll(relations: DeskRelations = []) {
    return this.repo.find({ relations });
  }

  findById(id: number, relations: DeskRelations = []) {
    return this.repo.findOne({ where: { id }, relations });
  }

  findByName(name: string, relations: DeskRelations = []) {
    return this.repo.findOne({ where: { name }, relations });
  }

  /** Find desks that can handle a specific service id */
  async findByServiceId(serviceId: number, relations: DeskRelations = []) {
    const qb = this.repo
        .createQueryBuilder("desk")
        .innerJoin("desk.services", "service", "service.id = :serviceId", { serviceId });

    if (relations.includes("services")) {
      qb.leftJoinAndSelect("desk.services", "s");
    }
    if (relations.includes("tickets")) {
      qb.leftJoinAndSelect("desk.tickets", "t");
    }

    return qb.getMany();
  }

  /** Utility for M:N */
  findServicesByIds(ids: number[]) {
    return this.serviceRepo.find({ where: { id: In(ids) } });
  }

  save(entity: DeskDAO) {
    return this.repo.save(entity);
  }

  delete(id: number) {
    return this.repo.delete(id);
  }
}
