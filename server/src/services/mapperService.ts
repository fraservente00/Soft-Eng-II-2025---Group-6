// services/mappers.ts (o dovunque risieda questo file)

import type { Desk } from "../models/DTO/Desk";
import type { Service } from "../models/DTO/Service";
import type { Ticket } from "../models/DTO/Ticket";

import { DeskDAO } from "../models/DAO/DeskDAO";
import { ServiceDAO } from "../models/DAO/ServiceDAO";
import { TicketDAO } from "../models/DAO/TicketDAO";

import type { StatusType } from "../models/StatusType";

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

function removeNullAttributes<T extends Record<string, any>>(dto: T): Partial<T> {
  return Object.fromEntries(
      Object.entries(dto).filter(
          ([, value]) =>
              value !== null &&
              value !== undefined &&
              (!Array.isArray(value) || value.length > 0)
      )
  ) as Partial<T>;
}

/* -------------------------------------------------------------------------- */
/*                              DTO Constructors                              */
/* -------------------------------------------------------------------------- */

export function createDeskDTO(
    id?: number,
    name?: string,
    services?: Desk[],
    tickets?: Ticket[]
): Desk {
  return removeNullAttributes({ id, name, services, tickets }) as Desk;
}

export function createServiceDTO(
    id?: number,
    name?: string,
    estimatedTime?: number,
    desks?: Desk[],
    tickets?: Ticket[]
): Service {
  return removeNullAttributes({ id, name, estimatedTime, desks, tickets }) as Service;
}

export function createTicketDTO(
    id?: number,
    status?: StatusType,
    createdAt?: Date,
    endedAt?: Date | null,
    service?: Service,
    managedBy?: Desk | null
): Ticket {
  return removeNullAttributes({
    id,
    status,
    createdAt,
    endedAt,
    service,
    managedBy,
  }) as Ticket;
}

/* -------------------------------------------------------------------------- */
/*                             DAO → DTO Mappers                              */
/* -------------------------------------------------------------------------- */

export function mapDeskDAOToDTO(deskDAO: DeskDAO): Desk {
  // Avoid deep cycles by default: map basic fields only
  return createDeskDTO(deskDAO.id, deskDAO.name);
}

export function mapServiceDAOToDTO(serviceDAO: ServiceDAO): Service {
  return createServiceDTO(
      serviceDAO.id,
      serviceDAO.name,
      serviceDAO.estimatedTime,
      serviceDAO.desks?.map((d) => mapDeskDAOToDTO(d))
      // tickets intentionally omitted to avoid cycles/large payloads
  );
}

export function mapTicketDAOToDTO(ticketDAO: TicketDAO): Ticket {
  return createTicketDTO(
      ticketDAO.id,
      ticketDAO.status,
      ticketDAO.createdAt,
      ticketDAO.endedAt ?? null,
      ticketDAO.service ? mapServiceDAOToDTO(ticketDAO.service) : undefined,
      ticketDAO.managedBy ? mapDeskDAOToDTO(ticketDAO.managedBy) : null
  );
}

/* -------------------------------------------------------------------------- */
/*                             DTO → DAO Mappers                              */
/* -------------------------------------------------------------------------- */

export function mapDeskDTOToDAO(desk: Desk): DeskDAO {
  const dao = new DeskDAO();
  if (desk.id !== undefined) dao.id = desk.id;
  if (desk.name !== undefined) dao.name = desk.name;
  // If you need to attach services for M:N updates, map them here:
  if (desk.services && desk.services.length > 0) {
    dao.services = desk.services.map((s) => {
      const sDao = new ServiceDAO();
      if (s.id !== undefined) sDao.id = s.id;
      if (s.name !== undefined) sDao.name = s.name;
      if (s.estimatedTime !== undefined) sDao.estimatedTime = s.estimatedTime;
      return sDao;
    });
  }
  return dao;
}

export function mapServiceDTOToDAO(service: Service): ServiceDAO {
  const dao = new ServiceDAO();
  if (service.id !== undefined) dao.id = service.id;
  if (service.name !== undefined) dao.name = service.name;
  if (service.estimatedTime !== undefined) dao.estimatedTime = service.estimatedTime;
  if (service.desks && service.desks.length > 0) {
    dao.desks = service.desks.map((d) => mapDeskDTOToDAO(d));
  }
  return dao;
}

export function mapTicketDTOToDAO(ticket: Ticket): TicketDAO {
  const dao = new TicketDAO();
  if (ticket.id !== undefined) dao.id = ticket.id;
  if (ticket.status !== undefined) dao.status = ticket.status;
  if (ticket.createdAt !== undefined) dao.createdAt = ticket.createdAt;
  if (ticket.endedAt !== undefined) dao.endedAt = ticket.endedAt;

  if (ticket.service) {
  dao.service = new ServiceDAO();
  if (ticket.service.id !== undefined) dao.service.id = ticket.service.id;
  // Remove setting name/estimatedTime here, let TypeORM handle the relation
}

if (ticket.managedBy !== undefined) {
  if (ticket.managedBy === null) {
    dao.managedBy = null;
  } else {
    dao.managedBy = new DeskDAO();
    if (ticket.managedBy.id !== undefined) dao.managedBy.id = ticket.managedBy.id;
    // Remove setting name
  }
}

  return dao;
}
