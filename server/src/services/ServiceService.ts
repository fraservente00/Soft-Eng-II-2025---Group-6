import { AppDataSource } from "../data-source";
import { ServiceRepository, ServiceRelations } from "../repositories/ServiceRepository";
import { ServiceDAO } from "../models/DAO/ServiceDAO";
import { NotFoundError } from "../models/errors/NotFoundError";
import { mapServiceDAOToDTO } from "./mapperService";
import type { Service } from "../models/DTO/Service";

export class ServiceService {
    private repo = new ServiceRepository();

    async list(withRelations: ServiceRelations = []): Promise<Service[]> {
        const items = await this.repo.findAll(withRelations);
        return items.map(mapServiceDAOToDTO);
    }

    async get(id: number, withRelations: ServiceRelations = []): Promise<Service> {
        const entity = await this.repo.findById(id, withRelations);
        if (!entity) throw new NotFoundError(`Service with ID ${id} not found`);
        return mapServiceDAOToDTO(entity);
    }

    async listByDesk(deskId: number, withRelations: ServiceRelations = []): Promise<Service[]> {
        const items = await this.repo.findByDeskId(deskId, withRelations);
        return items.map(mapServiceDAOToDTO);
    }

    async create(input: { name: string; estimatedTime: number; deskIds?: number[] }): Promise<Service> {
        // unique name
        const dup = await this.repo.findByName(input.name);
        if (dup) {
            throw Object.assign(new Error("Service name must be unique"), { code: "DUPLICATE_NAME" });
        }

        return AppDataSource.transaction(async () => {
            const entity = new ServiceDAO();
            entity.name = input.name;
            entity.estimatedTime = input.estimatedTime;

            if (input.deskIds?.length) {
                entity.desks = await this.repo.findDesksByIds(input.deskIds);
            }

            const saved = await this.repo.save(entity);
            return mapServiceDAOToDTO(saved);
        });
    }

    async update(
        id: number,
        input: { name?: string; estimatedTime?: number; deskIds?: number[] | null },
        withRelations: ServiceRelations = []
    ): Promise<Service> {
        const entity = await this.repo.findById(id, ["desks", ...withRelations]);
        if (!entity) throw new NotFoundError(`Service with ID ${id} not found`);

        if (input.name && input.name !== entity.name) {
            const dup = await this.repo.findByName(input.name);
            if (dup) {
                throw Object.assign(new Error("Service name must be unique"), { code: "DUPLICATE_NAME" });
            }
            entity.name = input.name;
        }

        if (typeof input.estimatedTime === "number") {
            entity.estimatedTime = input.estimatedTime;
        }

        if (input.deskIds !== undefined) {
            entity.desks = input.deskIds?.length ? await this.repo.findDesksByIds(input.deskIds) : [];
        }

        const saved = await this.repo.save(entity);
        return mapServiceDAOToDTO(saved);
    }

    async remove(id: number): Promise<void> {
        const res = await this.repo.delete(id);
        if (!res.affected) throw new NotFoundError(`Service with ID ${id} not found`);
    }
}
