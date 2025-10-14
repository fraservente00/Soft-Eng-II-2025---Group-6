import { Desk } from "../models/DTO/Desk";
import { DeskRepository } from "../repositories/DeskRepository";
import { mapDeskDAOToDTO, mapDeskDTOToDAO } from "../services/mapperService";
import { NotFoundError } from "../models/errors/NotFoundError";
import queueService  from "../services/queueService";
import { StatusType } from "../models/StatusType";
import { TicketRepository } from "../repositories/TicketRepository";
import { mapTicketDAOToDTO } from "../services/mapperService";

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

/** Call the next ticket for a desk
 * Returns the ticket details or null if no ticket is waiting
 */
export async function callNext(deskId: number) {
  // assicurati che le queue siano inizializzate (ricostruite dal DB)
  await queueService.init();

  const deskRepo = new DeskRepository();
  const deskDAO = await deskRepo.findWithServicesById(deskId);
  if (!deskDAO) throw new NotFoundError(`Desk with ID ${deskId} not found`);

  const ticketRepo = new TicketRepository();

  // scorri i servizi gestiti dal desk e prova a prelevare il primo ticket
  for (const svc of deskDAO.services || []) {
    const svcId = (svc as any).id;
    const ticketDAO = await queueService.dequeue(svcId);
    if (!ticketDAO) continue;

    // assegna il ticket al desk e setta TimeStarted / status
    ticketDAO.managedBy = deskDAO;
    ticketDAO.status = StatusType.Open as any;
    ticketDAO.TimeStarted = new Date();

    const updated = await ticketRepo.update(ticketDAO.id, ticketDAO);
    if (!updated) continue;

    // ritorna DTO
    return mapTicketDAOToDTO(updated);
  }

  return null;
}