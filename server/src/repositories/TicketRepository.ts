import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { TicketDAO } from "../models/DAO/TicketDAO";
import { StatusType } from "../models/StatusType";

export class TicketRepository {
  protected repository: Repository<TicketDAO>;

  constructor() {
    this.repository = AppDataSource.getRepository(TicketDAO);
  }

  async findAll(): Promise<TicketDAO[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<TicketDAO | null> {
    return this.repository.findOneBy({ id } as any);
  }

  // this is for managing queues when there is a crash
  async findByServiceIdStatus(serviceId: number, status: StatusType): Promise<TicketDAO[]> {
    return this.repository
        .createQueryBuilder("ticket")
        .innerJoin("ticket.service", "service")
        .where("service.id = :serviceId", { serviceId })
        .andWhere("ticket.status = :status", { status })
        .orderBy("ticket.id", "ASC")
        .getMany();
  }

  async findByServiceId(serviceId: number): Promise<TicketDAO[]> {
    return this.repository
      .createQueryBuilder("ticket")
      .innerJoin("ticket.services", "service", "service.id = :serviceId", { serviceId })
      .getMany();
  }

  async findByDeskId(deskId: number): Promise<TicketDAO[]> {
    return this.repository
      .createQueryBuilder("ticket")
      .innerJoin("ticket.managedBy", "desk", "desk.id = :deskId", { deskId })
      .getMany();
  }

  async updateStatus(id: number, status: StatusType): Promise<TicketDAO | null> {
    const entity = await this.repository.findOneBy({ id } as any);
    if (!entity) return null;
    entity.status = status;
    return this.repository.save(entity);
  }

  async create(data: Partial<TicketDAO>): Promise<TicketDAO> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: number, data: Partial<TicketDAO>): Promise<TicketDAO | null> {
    const entity = await this.repository.findOneBy({ id } as any);
    if (!entity) return null;
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}