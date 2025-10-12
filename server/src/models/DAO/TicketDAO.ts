import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne } from "typeorm";
import { StatusType } from "../StatusType";
import { DeskDAO } from "./DeskDAO";
import { ServiceDAO } from "./ServiceDAO";

@Entity()
export class TicketDAO {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  status!: StatusType;

  @Column()
  TimeStarted!: Date;

  @Column()
  TimeEnded: Date | undefined;

  // 🔁 Many tickets per one service
  @ManyToOne(() => ServiceDAO, (service) => service.tickets)
  service!: ServiceDAO;

  // 🔁 Many tickets per one desk
  @ManyToOne(() => DeskDAO, (desk) => desk.tickets)
  managedBy!: DeskDAO;
}
