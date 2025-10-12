// src/controllers/ticketController.ts
import { Router } from "express";
import { TicketService } from "../services/TicketService";
import type { StatusType } from "../models/StatusType";
import type { Ticket } from "../models/DTO/Ticket";

const router = Router();
const service = new TicketService();

// helper per ?with=service,managedBy
function parseWith(q: unknown) {
  const withParam = String(q ?? "");
  return withParam
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s === "service" || s === "managedBy") as Array<"service" | "managedBy">;
}

/** GET /api/tickets?with=service,managedBy */
router.get("/", async (req, res, next) => {
  try {
    const relations = parseWith(req.query.with);
    const data = await service.list(relations);
    res.json(data);
  } catch (e) { next(e); }
});

/** GET /api/tickets/:id?with=service,managedBy */
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const relations = parseWith(req.query.with);
    const data = await service.get(id, relations);
    res.json(data);
  } catch (e: any) {
    if (e?.name === "NotFoundError") return res.status(404).json({ error: e.message });
    next(e);
  }
});

/** GET /api/tickets/by-service/:serviceId?with=service,managedBy */
router.get("/by-service/:serviceId", async (req, res, next) => {
  try {
    const serviceId = Number(req.params.serviceId);
    const relations = parseWith(req.query.with);
    const data = await service.listByService(serviceId, relations);
    res.json(data);
  } catch (e) { next(e); }
});

/** GET /api/tickets/by-desk/:deskId?with=service,managedBy */
router.get("/by-desk/:deskId", async (req, res, next) => {
  try {
    const deskId = Number(req.params.deskId);
    const relations = parseWith(req.query.with);
    const data = await service.listByDesk(deskId, relations);
    res.json(data);
  } catch (e) { next(e); }
});

/** GET /api/tickets/by-service/:serviceId/status/:status */
router.get("/by-service/:serviceId/status/:status", async (req, res, next) => {
  try {
    const serviceId = Number(req.params.serviceId);
    const status = req.params.status as StatusType;
    const relations = parseWith(req.query.with);
    const data = await service.listByServiceAndStatus(serviceId, status, relations);
    res.json(data);
  } catch (e) { next(e); }
});

/** POST /api/tickets  (body: Ticket) */
router.post("/", async (req, res, next) => {
  try {
    const created = await service.create(req.body as Ticket);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

/** PUT /api/tickets/:id  (body: Partial<Ticket>) */
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updated = await service.update(id, req.body as Partial<Ticket>);
    res.json(updated);
  } catch (e: any) {
    if (e?.name === "NotFoundError") return res.status(404).json({ error: e.message });
    next(e);
  }
});

/** PATCH /api/tickets/:id/status  (body: { status: StatusType }) */
router.patch("/:id/status", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body as { status: StatusType };
    const updated = await service.updateStatus(id, status);
    res.json(updated);
  } catch (e: any) {
    if (e?.name === "NotFoundError") return res.status(404).json({ error: e.message });
    next(e);
  }
});

/** DELETE /api/tickets/:id */
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await service.remove(id);
    res.status(204).end();
  } catch (e: any) {
    if (e?.name === "NotFoundError") return res.status(404).json({ error: e.message });
    next(e);
  }
});

export default router;
