import { Desk } from "../models/DTO/Desk";
import { DeskRepository } from "../repositories/DeskRepository";
import { mapDeskDAOToDTO, mapDeskDTOToDAO, mapTicketDAOToDTO } from "../services/mapperService";
import { NotFoundError } from "../models/errors/NotFoundError";
import queueService from "../services/queueService";
import { TicketRepository } from "../repositories/TicketRepository";
import { StatusType } from "../models/StatusType";
import { sendTicketCalledEvent } from "../services/callService";
import { Ticket } from "../models/DTO/Ticket";

/**
 * Get all desks
 */
export async function getDesks(): Promise<Desk[]> {
  const deskRepo = new DeskRepository();
  const desks = await deskRepo.findAll();
  return desks.map(mapDeskDAOToDTO);
}

/**
 * Get a desk by ID
 */
export async function getDesk(id: number): Promise<Desk> {
  const deskRepo = new DeskRepository();
  const desk = await deskRepo.findById(id);
  if (!desk) {
    throw new NotFoundError(`Desk with ID ${id} not found`);
  }
  return mapDeskDAOToDTO(desk);
}

/**
 * Get all desks that manage a specific service
 */
export async function getDesksByServiceId(serviceId: number): Promise<Desk[]> {
  const deskRepo = new DeskRepository();
  const desks = await deskRepo.findByServiceId(serviceId);
  return desks.map(mapDeskDAOToDTO);
}

/**
 * Create a new desk
 */
export async function createDesk(deskDto: Desk): Promise<Desk> {
  const deskRepo = new DeskRepository();
  const deskDao = mapDeskDTOToDAO(deskDto);
  const createdDesk = await deskRepo.create(deskDao);
  return mapDeskDAOToDTO(createdDesk);
}

/**
 * Update an existing desk
 */
export async function updateDesk(id: number, deskDto: Desk): Promise<Desk> {
  const deskRepo = new DeskRepository();
  const deskDaoPartial = mapDeskDTOToDAO(deskDto);
  const updatedDesk = await deskRepo.update(id, deskDaoPartial);
  if (!updatedDesk) {
    throw new NotFoundError(`Desk with ID ${id} not found`);
  }
  return mapDeskDAOToDTO(updatedDesk);
}

/**
 * Delete a desk
 */
export async function deleteDesk(id: number): Promise<void> {
  const deskRepo = new DeskRepository();
  const deleted = await deskRepo.delete(id);
  if (!deleted) {
    throw new NotFoundError(`Desk with ID ${id} not found`);
  }
}

export async function callNext(deskId: number) {
  await queueService.init();

  const deskRepo = new DeskRepository();
  const deskDAO = await deskRepo.findWithServicesById(deskId);
  if (!deskDAO) throw new NotFoundError(`Desk with ID ${deskId} not found`);

  const ticketRepo = new TicketRepository();

  for (const svc of deskDAO.services || []) {
    const svcId = (svc as any).id;

    // PRENDI il prossimo dalla coda (NON peek)
    const ticketDAO = await queueService.dequeue(svcId); // <-- cambia qui
    if (!ticketDAO) continue;

    ticketDAO.managedBy = deskDAO;

    const ticket = mapTicketDAOToDTO(ticketDAO);

    await callTicket(ticket); // dovrebbe mandare l'evento SSE
    // assegna il ticket al desk e setta TimeStarted / status
    ticketDAO.status = StatusType.open as any;
    //ticketDAO.TimeStarted = new Date();

    // opzionale: se vuoi registrare chi lo sta gestendo
    ticketDAO.managedBy = deskDAO;

    // NON cambiare lo status qui (rimane 'open')
    // ticketDAO.status = StatusType.open as any;

    const updated = await ticketRepo.update(ticketDAO.id, ticketDAO);
    if (!updated) continue;

    const dto = mapTicketDAOToDTO(updated);
    await callTicket(dto); // solo SSE, niente chiusura
    return dto;
  }

  return null;
}

export async function callTicket(ticketCalled: Ticket) {
  // NON chiudere qui.
  sendTicketCalledEvent(ticketCalled);
}
