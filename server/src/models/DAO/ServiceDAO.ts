import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from "typeorm";
import { DeskDAO } from "./DeskDAO";
import { TicketDAO   } from "./TicketDAO";

@Entity()
export class ServiceDAO {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  estimatedTime!: number; // in minutes, for example

  // 🔁 Relation with Desk (many-to-many)
  @ManyToMany(() => DeskDAO, (desk) => desk.services)
  desks!: DeskDAO[];

  // 🔁 Relation with Ticket (one-to-many)
  @OneToMany(() => TicketDAO, (ticket) => ticket.service)
  tickets!: TicketDAO[];
}
