import { Response } from "express";
import { Ticket } from "../models/DTO/Ticket";


const clients: Response[] = [];

// called when frontend subscribes
export function addClient(req: any, res: Response) {
  clients.push(res);

  // Remove client when connection closes
  (req as unknown as NodeJS.EventEmitter).on("close", () => {
    removeClient(res);
  });
}

export function removeClient(res: Response) {
  const index = clients.indexOf(res);
  if (index !== -1) clients.splice(index, 1);
}

export function sendTicketCalledEvent( ticketData: Ticket) {
  clients.forEach(res => {
    res.write(`event: ticketCalled\n`);
    res.write(`data: ${JSON.stringify(ticketData)}\n\n`);
  });
}