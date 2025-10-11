import { Desk } from "../models/DTO/Desk";
import { DeskRepository } from "../repositories/DeskRepository";
import { mapDeskDAOToDTO } from "../services/mapperService";
import { NotFoundError } from "../models/errors/NotFoundError";

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
  const createdDesk = await deskRepo.create(deskDto);
  return mapDeskDAOToDTO(createdDesk);
}

/**
 * Update an existing desk
 */
export async function updateDesk(id: number, deskDto: Partial<Desk>): Promise<Desk> {
  const deskRepo = new DeskRepository();
  const updatedDesk = await deskRepo.update(id, deskDto);
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
