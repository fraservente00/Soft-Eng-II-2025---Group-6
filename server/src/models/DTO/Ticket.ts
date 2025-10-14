// DTO/Ticket.ts
import type { StatusType } from "../StatusType";
import type { Desk } from "./Desk";
import type { Service } from "./Service";

/**
 * Ticket DTO used for API I/O and view models.
 * Mirrors TicketDAO while keeping relations optional.
 */
export interface Ticket {
    /** Database identifier (auto-generated) */
    id?: number;

    /** Ticket status (e.g., "open" | "closed") */
    status?: StatusType;

    /** Creation timestamp */
    createdAt?: Date;

    /** When the ticket was completed/closed (nullable) */
    endedAt?: Date | null;

    /** Related service (required in DB, optional in DTO payloads) */
    service?: Service;

    /** Desk that handled the ticket (nullable until assigned) */
    managedBy?: Desk | null;
}
