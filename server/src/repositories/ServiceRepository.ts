import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { ServiceDAO } from "../models/DAO/ServiceDAO";

export class ServiceRepository {
  protected repository: Repository<ServiceDAO>;

  constructor() {
    this.repository = AppDataSource.getRepository(ServiceDAO);
  }

  async findAll(): Promise<ServiceDAO[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<ServiceDAO | null> {
    return this.repository.findOneBy({ id } as any);
  }

  async findByDeskId(deskId: number): Promise<ServiceDAO[]> {
    return this.repository
      .createQueryBuilder("service")
      .innerJoin("service.desks", "desk", "desk.id = :deskId", { deskId })
      .getMany();
  }

  async create(data: ServiceDAO): Promise<ServiceDAO> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: number, data: ServiceDAO): Promise<ServiceDAO | null> {
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