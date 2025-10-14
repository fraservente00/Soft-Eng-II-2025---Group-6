import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { StatusType } from "../StatusType";
import { DeskDAO } from "./DeskDAO";
import { ServiceDAO } from "./ServiceDAO";

@Entity({ name: "tickets" })
export class TicketDAO {
  @PrimaryGeneratedColumn()
  id!: number; // set by TypeORM at runtime (definite assignment)

  @Column({ type: "text" })
  status!: StatusType; // e.g., "open" | "closed" (from StatusType)

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date; // was TimeStarted

  @Column({ type: "datetime", nullable: true })
  endedAt?: Date | null; // was TimeEnded

  // Ticket ↔ Service (N:1): a ticket belongs to one service
  @ManyToOne(() => ServiceDAO, (service) => service.tickets, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  service!: ServiceDAO;

  // Ticket ↔ Desk (N:1): the desk that handled the ticket (may be null before assignment)
  @ManyToOne(() => DeskDAO, (desk) => desk.tickets, {
    nullable: true,
    onDelete: "SET NULL",
  })
  managedBy!: DeskDAO | null;
}
