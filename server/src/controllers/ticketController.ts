import { Ticket } from "../models/DTO/Ticket";
import { TicketRepository } from "../repositories/TicketRepository";
import { mapTicketDAOToDTO, mapTicketDTOToDAO } from "../services/mapperService";
import { NotFoundError } from "../models/errors/NotFoundError";
import { StatusType } from "../models/StatusType";
import { Request, Response } from "express";
import { addClient } from "../services/callService";

/**
 * Get all tickets
 */
export async function getTickets(): Promise<Ticket[]> {
  const ticketRepo = new TicketRepository();
  const tickets = await ticketRepo.findAll();
  return tickets.map(mapTicketDAOToDTO);
}

/**
 * Get a ticket by ID
 */
export async function getTicket(id: number): Promise<Ticket> {
  const ticketRepo = new TicketRepository();
  const ticket = await ticketRepo.findById(id);
  if (!ticket) throw new NotFoundError(`Ticket with ID ${id} not found`);
  return mapTicketDAOToDTO(ticket);
}

/**
 * Get tickets by service ID
 */
export async function getTicketsByServiceId(serviceId: number): Promise<Ticket[]> {
  const ticketRepo = new TicketRepository();
  const tickets = await ticketRepo.findByServiceId(serviceId);
  return tickets.map(mapTicketDAOToDTO);
}

/**
 * Get tickets by desk ID
 */
export async function getTicketsByDeskId(deskId: number): Promise<Ticket[]> {
  const ticketRepo = new TicketRepository();
  const tickets = await ticketRepo.findByDeskId(deskId);
  return tickets.map(mapTicketDAOToDTO);
}

/**
 * Get tickets by service ID and status (for queue recovery)
 */
export async function getTicketsByServiceIdAndStatus(
  serviceId: number,
  status: StatusType
): Promise<Ticket[]> {
  const ticketRepo = new TicketRepository();
  const tickets = await ticketRepo.findByServiceIdStatus(serviceId, status);
  return tickets.map(mapTicketDAOToDTO);
}

/**
 * Create a new ticket
 */
export async function createTicket(ticketDto: Ticket): Promise<Ticket> {
  const ticketRepo = new TicketRepository();

  // Map DTO → DAO
  const ticketDAO = mapTicketDTOToDAO(ticketDto);

  // Save DAO
  const createdTicket = await ticketRepo.create(ticketDAO);

  // Map DAO → DTO
  return mapTicketDAOToDTO(createdTicket);
}


/**
 * Update a ticket
 */
export async function updateTicket(id: number, ticketDto: Partial<Ticket>): Promise<Ticket> {
  const ticketRepo = new TicketRepository();

  // Convert DTO → DAO
  const ticketDAOData = mapTicketDTOToDAO(ticketDto as Ticket);

  const updatedTicket = await ticketRepo.update(id, ticketDAOData);
  if (!updatedTicket) throw new NotFoundError(`Ticket with ID ${id} not found`);

  // Convert DAO → DTO
  return mapTicketDAOToDTO(updatedTicket);
}


/**
 * Update a ticket's status
 */
export async function updateTicketStatus(id: number, status: StatusType): Promise<Ticket> {
  const ticketRepo = new TicketRepository();
  const updatedTicket = await ticketRepo.updateStatus(id, status);
  if (!updatedTicket) throw new NotFoundError(`Ticket with ID ${id} not found`);
  return mapTicketDAOToDTO(updatedTicket);
}

/**
 * Delete a ticket
 */
export async function deleteTicket(id: number): Promise<void> {
  const ticketRepo = new TicketRepository();
  const deleted = await ticketRepo.delete(id);
  if (!deleted) throw new NotFoundError(`Ticket with ID ${id} not found`);
}

/** Subscribe to ticket events (SSE) */

export function subscribeToTickets(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  addClient(req, res);
}

