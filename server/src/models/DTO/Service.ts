// DTO/Service.ts
import type { Desk } from "./Desk";
import type { Ticket } from "./Ticket";

/**
 * Service DTO used for API I/O and view models.
 * Mirrors ServiceDAO while keeping relations optional.
 */
export interface Service {
    /** Database identifier (auto-generated) */
    id?: number;

    /** Human-readable name, e.g., "ID Card", "Registry Certificate" */
    name: string;

    /** Estimated handling time in minutes */
    estimatedTime: number;

    /** Desks that can handle this service (optional) */
    desks?: Desk[];

    /** Tickets associated with this service (optional) */
    tickets?: Ticket[];
}
