import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { ServiceDAO } from "./ServiceDAO";
import { TicketDAO } from "./TicketDAO";

@Entity({ name: "desks" })
export class DeskDAO {
  @PrimaryGeneratedColumn()
  id!: number; // set by TypeORM at runtime (definite assignment)

  @Column({ type: "text", unique: true })
  name!: string; // e.g., "Desk 1" / "Registry Counter"

  // Desk ↔ Service (M:N)
  @ManyToMany(() => ServiceDAO, (service) => service.desks)
  @JoinTable({
    name: "desk_services", // explicit join table name
    joinColumn: { name: "desk_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "service_id", referencedColumnName: "id" },
  })
  services!: ServiceDAO[];

  // Desk ↔ Ticket (1:N): tickets handled by this desk
  @OneToMany(() => TicketDAO, (ticket) => ticket.managedBy)
  tickets!: TicketDAO[];
}
