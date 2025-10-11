import { StatusType } from "../StatusType";
import { Desk } from "./Desk";
import { Service } from "./Service";

/**
 * 
 * @export
 * @interface Ticket
 */
export interface Ticket {
    id?: number;
    Status?: StatusType;
    TimeStarted?: Date;
    TimeEnded?: Date;
    service?: Service;
    managedBy?: Desk;
}