import { AppDataSource } from "../data-source";
import { DeskRepository, DeskRelations } from "../repositories/DeskRepository";
import { DeskDAO } from "../models/DAO/DeskDAO";
import { NotFoundError } from "../models/errors/NotFoundError";
import { mapDeskDAOToDTO } from "./mapperService"; // usa il tuo file attuale
import type { Desk } from "../models/DTO/Desk";

export class DeskService {
    private repo = new DeskRepository();

    async list(withRelations: DeskRelations = []): Promise<Desk[]> {
        const desks = await this.repo.findAll(withRelations);
        return desks.map(mapDeskDAOToDTO);
    }

    async get(id: number, withRelations: DeskRelations = []): Promise<Desk> {
        const desk = await this.repo.findById(id, withRelations);
        if (!desk) throw new NotFoundError(`Desk with ID ${id} not found`);
        return mapDeskDAOToDTO(desk);
    }

    async listByService(serviceId: number, withRelations: DeskRelations = []): Promise<Desk[]> {
        const desks = await this.repo.findByServiceId(serviceId, withRelations);
        return desks.map(mapDeskDAOToDTO);
    }

    async create(input: { name: string; serviceIds?: number[] }): Promise<Desk> {
        // regola: name unico
        const dup = await this.repo.findByName(input.name);
        if (dup) {
            // restituisci 409 a livello controller
            throw Object.assign(new Error("Desk name must be unique"), { code: "DUPLICATE_NAME" });
        }

        return AppDataSource.transaction(async () => {
            const entity = new DeskDAO();
            entity.name = input.name;

            if (input.serviceIds?.length) {
                entity.services = await this.repo.findServicesByIds(input.serviceIds);
            }

            const saved = await this.repo.save(entity);
            return mapDeskDAOToDTO(saved);
        });
    }

    async update(
        id: number,
        input: { name?: string; serviceIds?: number[] | null },
        withRelations: DeskRelations = []
    ): Promise<Desk> {
        const desk = await this.repo.findById(id, ["services", ...withRelations]);
        if (!desk) throw new NotFoundError(`Desk with ID ${id} not found`);

        if (input.name && input.name !== desk.name) {
            const dup = await this.repo.findByName(input.name);
            if (dup) {
                throw Object.assign(new Error("Desk name must be unique"), { code: "DUPLICATE_NAME" });
            }
            desk.name = input.name;
        }

        if (input.serviceIds !== undefined) {
            desk.services = input.serviceIds?.length
                ? await this.repo.findServicesByIds(input.serviceIds)
                : [];
        }

        const saved = await this.repo.save(desk);
        return mapDeskDAOToDTO(saved);
    }

    async remove(id: number): Promise<void> {
        const res = await this.repo.delete(id);
        if (!res.affected) throw new NotFoundError(`Desk with ID ${id} not found`);
    }
}
