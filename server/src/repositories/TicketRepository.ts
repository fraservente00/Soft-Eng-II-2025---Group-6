import { In, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { TicketDAO } from "../models/DAO/TicketDAO";
import { ServiceDAO } from "../models/DAO/ServiceDAO";
import { DeskDAO } from "../models/DAO/DeskDAO";
import type { StatusType } from "../models/StatusType";

export type TicketRelations = Array<"service" | "managedBy">;

export class TicketRepository {
  private repo: Repository<TicketDAO>;
  private serviceRepo: Repository<ServiceDAO>;
  private deskRepo: Repository<DeskDAO>;

  constructor() {
    this.repo = AppDataSource.getRepository(TicketDAO);
    this.serviceRepo = AppDataSource.getRepository(ServiceDAO);
    this.deskRepo = AppDataSource.getRepository(DeskDAO);
  }

  /** Utility: apply conditional relations to a query builder */
  private applyRelations<T extends import("typeorm").SelectQueryBuilder<TicketDAO>>(
      qb: T,
      relations: TicketRelations
  ): T {
    if (relations.includes("service")) {
      qb.leftJoinAndSelect("ticket.service", "service");
    }
    if (relations.includes("managedBy")) {
      qb.leftJoinAndSelect("ticket.managedBy", "desk");
    }
    return qb;
  }

  /** List tickets (optionally loading relations) */
  async findAll(relations: TicketRelations = []): Promise<TicketDAO[]> {
    const qb = this.repo.createQueryBuilder("ticket");
    this.applyRelations(qb, relations);
    return qb.getMany();
  }

  /** Get one ticket by id */
  async findById(id: number, relations: TicketRelations = []): Promise<TicketDAO | null> {
    const qb = this.repo.createQueryBuilder("ticket").where("ticket.id = :id", { id });
    this.applyRelations(qb, relations);
    return qb.getOne();
  }

  /** Tickets for a given service */
  async findByServiceId(serviceId: number, relations: TicketRelations = []): Promise<TicketDAO[]> {
    const qb = this.repo
        .createQueryBuilder("ticket")
        .innerJoin("ticket.service", "svc", "svc.id = :serviceId", { serviceId });
    this.applyRelations(qb, relations);
    return qb.getMany();
  }

  /** Tickets for a given desk */
  async findByDeskId(deskId: number, relations: TicketRelations = []): Promise<TicketDAO[]> {
    const qb = this.repo
        .createQueryBuilder("ticket")
        .innerJoin("ticket.managedBy", "desk", "desk.id = :deskId", { deskId });
    this.applyRelations(qb, relations);
    return qb.getMany();
  }

  /** Tickets for a given service and status (queue recovery) */
  async findByServiceIdStatus(
      serviceId: number,
      status: StatusType,
      relations: TicketRelations = []
  ): Promise<TicketDAO[]> {
    const qb = this.repo
        .createQueryBuilder("ticket")
        .innerJoin("ticket.service", "svc", "svc.id = :serviceId", { serviceId })
        .where("ticket.status = :status", { status });
    this.applyRelations(qb, relations);
    return qb.getMany();
  }

  /** Load many services by ids (ignore missing) */
  async findServicesByIds(ids: number[]): Promise<ServiceDAO[]> {
    if (!ids.length) return [];
    return this.serviceRepo.find({ where: { id: In(ids) } });
  }

  /** Simple helpers to resolve relations */
  async findServiceById(id: number): Promise<ServiceDAO | null> {
    return this.serviceRepo.findOne({ where: { id } });
  }
  async findDeskById(id: number): Promise<DeskDAO | null> {
    return this.deskRepo.findOne({ where: { id } });
  }

  /** Persist helpers */
  save(entity: TicketDAO): Promise<TicketDAO> {
    return this.repo.save(entity);
  }

  async updateStatus(id: number, status: StatusType): Promise<TicketDAO | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    entity.status = status;
    return this.repo.save(entity);
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.repo.delete(id);
    return !!res.affected;
  }
}
