import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { DeskDAO } from "./DeskDAO";
import { TicketDAO } from "./TicketDAO";

@Entity({ name: "services" })
export class ServiceDAO {
  @PrimaryGeneratedColumn()
  id!: number; // set by TypeORM at runtime (definite assignment)

  @Column({ type: "text", unique: true })
  name!: string; // e.g., "ID Card", "Registry Certificate"

  @Column({ type: "integer" })
  estimatedTime!: number; // in minutes

  // Service ↔ Desk (M:N)
  @ManyToMany(() => DeskDAO, (desk) => desk.services)
  desks!: DeskDAO[];

  // Service ↔ Ticket (1:N)
  @OneToMany(() => TicketDAO, (ticket) => ticket.service)
  tickets!: TicketDAO[];
}
