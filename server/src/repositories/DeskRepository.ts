import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { DeskDAO } from "../models/DAO/DeskDAO";

export class DeskRepository {
  protected repository: Repository<DeskDAO>;

  constructor() {
    this.repository = AppDataSource.getRepository(DeskDAO);
  }

  async findAll(): Promise<DeskDAO[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<DeskDAO | null> {
    return this.repository.findOneBy({ id } as any);
  }

  async findByServiceId(serviceId: number): Promise<DeskDAO[]> {
    return this.repository
      .createQueryBuilder("desk")
      .innerJoin("desk.services", "service", "service.id = :serviceId", { serviceId })
      .getMany();
  }

  async create(data: Partial<DeskDAO>): Promise<DeskDAO> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: number, data: Partial<DeskDAO>): Promise<DeskDAO | null> {
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
