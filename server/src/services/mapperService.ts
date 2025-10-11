import { Desk } from "../models/DTO/Desk";
import { Service } from "../models/DTO/Service";
import { Ticket } from "../models/DTO/Ticket";

import { DeskDAO } from "../models/DAO/DeskDAO";
import { ServiceDAO } from "../models/DAO/ServiceDAO";
import { TicketDAO } from "../models/DAO/TicketDAO";

import { StatusType } from "../models/StatusType";
/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

function removeNullAttributes<T extends Record<string, any>>(dto: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(dto).filter(
      ([_, value]) =>
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
  ) as Partial<T>;
}


/* -------------------------------------------------------------------------- */
/*                              DTO Constructors                              */
/* -------------------------------------------------------------------------- */

export function createDeskDTO(id?: number): Desk {
  return removeNullAttributes({ id }) as Desk;
}

export function createServiceDTO(
  id?: number,
  estimatedTime?: number,
  desks?: Desk[]
): Service {
  return removeNullAttributes({
    id,
    estimatedTime,
    desks,
  }) as Service;
}

export function createTicketDTO(
  id?: number,
  Status?: StatusType,
  TimeStarted?: Date,
  TimeEnded?: Date,
  service?: Service,
  managedBy?: Desk
): Ticket {
  return removeNullAttributes({
    id,
    Status,
    TimeStarted,
    TimeEnded,
    service,
    managedBy,
  }) as Ticket;
}

/* -------------------------------------------------------------------------- */
/*                             DAO → DTO Mappers                              */
/* -------------------------------------------------------------------------- */

export function mapDeskDAOToDTO(deskDAO: DeskDAO): Desk {
  return createDeskDTO(deskDAO.id);
}

export function mapServiceDAOToDTO(serviceDAO: ServiceDAO): Service {
  return createServiceDTO(
    serviceDAO.id,
    serviceDAO.estimatedTime,
    serviceDAO.desks?.map((desk: any) => mapDeskDAOToDTO(desk))
  );
}

export function mapTicketDAOToDTO(ticketDAO: TicketDAO): Ticket {
  return createTicketDTO(
    ticketDAO.id,
    ticketDAO.status,
    ticketDAO.TimeStarted,
    ticketDAO.TimeEnded,
    ticketDAO.service ? mapServiceDAOToDTO(ticketDAO.service) : undefined,
    ticketDAO.managedBy ? mapDeskDAOToDTO(ticketDAO.managedBy) : undefined
  );
}

/* -------------------------------------------------------------------------- */
/*                             DTO → DAO Mappers                              */
/* -------------------------------------------------------------------------- */

export function mapDeskDTOToDAO(desk: Desk): DeskDAO {
  const dao = new DeskDAO();
  if (desk.id) dao.id = desk.id;
  return dao;
}

export function mapServiceDTOToDAO(service: Service): ServiceDAO {
  const dao = new ServiceDAO();
  if (service.id) dao.id = service.id;
  if (service.estimatedTime) dao.estimatedTime = service.estimatedTime;
  return dao;
}

export function mapTicketDTOToDAO(ticket: Ticket): TicketDAO {
  const dao = new TicketDAO();
  if (ticket.id) dao.id = ticket.id;
  if (ticket.Status) dao.status = ticket.Status;
  if (ticket.TimeStarted) dao.TimeStarted = ticket.TimeStarted;
  if (ticket.TimeEnded) dao.TimeEnded = ticket.TimeEnded;
  if (ticket.service) dao.service = mapServiceDTOToDAO(ticket.service);
  if (ticket.managedBy) dao.managedBy = mapDeskDTOToDAO(ticket.managedBy);
  return dao;
}
