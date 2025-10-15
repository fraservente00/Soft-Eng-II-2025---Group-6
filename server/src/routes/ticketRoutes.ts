import { Router } from "express";
import * as ticketController from "../controllers/ticketController";
import express from "express";
import cors from "cors";

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

const app = express();
app.use(cors());

let clients: any[] = [];

// SSE endpoint
app.get("/subscribe", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Add the client to our list
  clients.push(res);

  // Remove client when disconnected
  req.on("close", () => {
    clients = clients.filter(c => c !== res);
  });
});

app.listen(3000, () => console.log("SSE server running on port 3000"));
export default router;
