import type { Ticket } from "../models/DTO/Ticket";
import type { StatusType } from "../models/StatusType";
import { NotFoundError } from "../models/errors/NotFoundError";
import { TicketRepository, TicketRelations } from "../repositories/TicketRepository";
import { mapTicketDAOToDTO, mapTicketDTOToDAO } from "./mapperService";

export class TicketService {
    private repo = new TicketRepository();

    async list(withRelations: TicketRelations = []): Promise<Ticket[]> {
        const rows = await this.repo.findAll(withRelations);
        return rows.map(mapTicketDAOToDTO);
    }

    async get(id: number, withRelations: TicketRelations = []): Promise<Ticket> {
        const row = await this.repo.findById(id, withRelations);
        if (!row) throw new NotFoundError(`Ticket with ID ${id} not found`);
        return mapTicketDAOToDTO(row);
    }

    async listByService(serviceId: number, withRelations: TicketRelations = []): Promise<Ticket[]> {
        const rows = await this.repo.findByServiceId(serviceId, withRelations);
        return rows.map(mapTicketDAOToDTO);
    }

    async listByDesk(deskId: number, withRelations: TicketRelations = []): Promise<Ticket[]> {
        const rows = await this.repo.findByDeskId(deskId, withRelations);
        return rows.map(mapTicketDAOToDTO);
    }

    async listByServiceAndStatus(
        serviceId: number,
        status: StatusType,
        withRelations: TicketRelations = []
    ): Promise<Ticket[]> {
        const rows = await this.repo.findByServiceIdStatus(serviceId, status, withRelations);
        return rows.map(mapTicketDAOToDTO);
    }

    async create(input: Ticket): Promise<Ticket> {
        // usa i mapper per costruire il DAO
        const dao = mapTicketDTOToDAO(input);
        const saved = await this.repo.save(dao);
        return mapTicketDAOToDTO(saved);
    }

    async update(id: number, patch: Partial<Ticket>): Promise<Ticket> {
        const existing = await this.repo.findById(id, []);
        if (!existing) throw new NotFoundError(`Ticket with ID ${id} not found`);
        const toSave = Object.assign(existing, mapTicketDTOToDAO(patch as Ticket));
        const saved = await this.repo.save(toSave);
        return mapTicketDAOToDTO(saved);
    }

    async updateStatus(id: number, status: StatusType): Promise<Ticket> {
        const updated = await this.repo.updateStatus(id, status);
        if (!updated) throw new NotFoundError(`Ticket with ID ${id} not found`);
        return mapTicketDAOToDTO(updated);
    }

    async remove(id: number): Promise<void> {
        const ok = await this.repo.delete(id);   // <- boolean
        if (!ok) throw new NotFoundError(`Ticket with ID ${id} not found`);
    }
}
