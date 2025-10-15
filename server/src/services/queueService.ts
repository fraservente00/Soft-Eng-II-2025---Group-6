import { ServiceRepository } from "../repositories/ServiceRepository";
import { TicketRepository } from "../repositories/TicketRepository";
import { StatusType } from "../models/StatusType";
import { mapTicketDAOToDTO } from "./mapperService";
import {TicketDAO} from "../models/DAO/TicketDAO";

/**
 * QueueService
 * - mantiene Map<serviceId, ticketId[]>
 * - init() ricostruisce le code dal DB (ticket aperti)
 * - enqueueAfterCreate(): aggiunge al fondo della coda
 * - dequeueFromService(): rimuove e ritorna il ticket DAO (o null)
 */
class QueueService {
  private queues: Map<number, number[]> = new Map();
  private initialized = false;

  async init() {
    if (this.initialized) return;
    const serviceRepo = new ServiceRepository();
    const ticketRepo = new TicketRepository();

    const services = await serviceRepo.findAll();
    for (const s of services) {
      const serviceId = (s as any).id;
      // leggi ticket aperti dal DB come fallback (ordine by id asc)
      const tickets = await ticketRepo.findByServiceIdStatus(serviceId, StatusType.open as any).catch(() => []);
      const sortedIds = (tickets || []).map((t: any) => t.id).sort((a: number, b: number) => a - b);
      this.queues.set(serviceId, sortedIds);
    }
    this.initialized = true;
  }

  ensureQueue(serviceId: number) {
    if (!this.queues.has(serviceId)) this.queues.set(serviceId, []);
  }

  enqueue(ticketDAO: any) {
    const serviceId = ticketDAO?.service?.id;
    if (!serviceId) return;
    this.ensureQueue(serviceId);
    this.queues.get(serviceId)!.push(ticketDAO.id);
  }

  // rimuove il primo ticket disponibile per il serviceId
  async dequeue(serviceId: number): Promise<any | null> {
    this.ensureQueue(serviceId);
    const arr = this.queues.get(serviceId)!;
    if (arr.length === 0) return null;
    const ticketId = arr.shift()!;
    const ticketRepo = new TicketRepository();
    const ticket = await ticketRepo.findById(ticketId);

    return ticket || null;
  }

  remove(ticketId: number) {
    for (const [serviceId, queue] of this.queues.entries()) {
      // Filtra l'array per rimuovere il ticketId
      const updatedQueue = queue.filter((id) => id !== ticketId);

      // Aggiorna la coda nella mappa
      this.queues.set(serviceId, updatedQueue);
    }
  }

  async peek(serviceId: number): Promise<TicketDAO | null> {
    this.ensureQueue(serviceId);
    const arr = this.queues.get(serviceId)!;
    if (arr.length === 0) return null;
    const ticketId = arr[0]!;
    const ticketRepo = new TicketRepository();
    const ticket = await ticketRepo.findById(ticketId);

    return ticket;
  }

  // helper: ritorna array di serviceId per un desk (non modifica DB)
  getQueueLength(serviceId: number) {
    this.ensureQueue(serviceId);
    return this.queues.get(serviceId)!.length;
  }

  // per debug/inspection
  dump() {
    const obj: Record<string, number[]> = {};
    for (const [k, v] of this.queues.entries()) obj[String(k)] = [...v];
    return obj;
  }

  getQueuePerId(serviceId: number): number[] {
    this.ensureQueue(serviceId);
    return (this.queues.get(serviceId)!); // We are sure the calls to queues.get() won't return null
  }
}

export default new QueueService();