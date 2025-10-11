import { Router } from "express";
import * as ticketController from "../controllers/ticketController";

const router = Router();

// GET /api/tickets
router.get("/", async (req, res, next) => {
  try { res.json(await ticketController.getTickets()); } catch (e) { next(e); }
});

// GET /api/tickets/:id
router.get("/:id", async (req, res, next) => {
  try { res.json(await ticketController.getTicket(Number(req.params.id))); } catch (e) { next(e); }
});

// POST /api/tickets
router.post("/", async (req, res, next) => {
  try {
    // body: { serviceId: number, ...optional fields }
    const created = await ticketController.createTicket(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// PATCH /api/tickets/:id/status
router.patch("/:id/status", async (req, res, next) => {
  try {
    const updated = await ticketController.updateTicketStatus(
      Number(req.params.id),
      req.body.status
    );
    res.json(updated);
  } catch (e) { next(e); }
});

// GET /api/tickets/service/:serviceId
router.get("/service/:serviceId", async (req, res, next) => {
  try { res.json(await ticketController.getTicketsByServiceId(Number(req.params.serviceId))); } catch (e) { next(e); }
});

// GET /api/tickets/desk/:deskId
router.get("/desk/:deskId", async (req, res, next) => {
  try { res.json(await ticketController.getTicketsByDeskId(Number(req.params.deskId))); } catch (e) { next(e); }
});

// GET /api/tickets/code/:code/eta
/*router.get("/code/:code/eta", async (req, res, next) => {
  try { res.json(await ticketController.getTicketETA(req.params.code)); } catch (e) { next(e); }
});*/

export default router;
