import { Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { ServiceDAO } from "./ServiceDAO";
import { TicketDAO } from "./TicketDAO";

@Entity()
export class DeskDAO {
  @PrimaryGeneratedColumn()
  id!: number;

  // 🔁 Many-to-many with Service
  @ManyToMany(() => ServiceDAO, (service) => service.desks)
  @JoinTable() // This will create a join table: desk_services_service
  services!: ServiceDAO[];

  // 🔁 One-to-many with Ticket
  @OneToMany(() => TicketDAO, (ticket) => ticket.managedBy)
  tickets!: TicketDAO[];
}
