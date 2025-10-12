// DTO/Desk.ts
import type { Service } from "./Service";
import type { Ticket } from "./Ticket";

/**
 * Desk DTO used for API I/O and view models.
 * Mirrors DeskDAO shape but keeps relations optional.
 */
export interface Desk {
    /** Database identifier (auto-generated) */
    id?: number;

    /** Human-readable name, e.g., "Desk 1" / "Registry Counter" */
    name: string;

    /** Services this desk can handle (optional, often omitted in list views) */
    services?: Service[];

    /** Tickets handled by this desk (optional, avoid in large payloads) */
    tickets?: Ticket[];
}
