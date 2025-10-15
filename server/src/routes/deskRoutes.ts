import { Router } from "express";
import * as deskController from "../controllers/deskController";
import * as serviceController from  "../controllers/serviceController"

const router = Router();

// GET /api/desks
router.get("/", async (req, res, next) => {
  try { res.json(await deskController.getDesks()); } catch (e) { next(e); }
});

// GET /api/desks/:id
router.get("/:id", async (req, res, next) => {
  try { res.json(await deskController.getDesk(Number(req.params.id))); } catch (e) { next(e); }
});

// POST /api/desks
router.post("/", async (req, res, next) => {
  try { res.status(201).json(await deskController.createDesk(req.body)); } catch (e) { next(e); }
});

// PUT /api/desks/:id
router.put("/:id", async (req, res, next) => {
  try { res.json(await deskController.updateDesk(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

// DELETE /api/desks/:id
router.delete("/:id", async (req, res, next) => {
  try { await deskController.deleteDesk(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); }
});

// GET /api/desks/:id/next  <-- core operation
router.get("/:id/next", async (req, res, next) => {
  try {
    const result = await deskController.callNext(Number(req.params.id));
    if (!result) return res.status(204).send();
    return res.json(result);
  } catch (e) { next(e); }
});


router.get("/:id/services", async (req, res, next) => {
  try {
    const result = await serviceController.getServicesByDeskId(Number(req.params.id));
    if (!result) return res.status(204).send();
    return res.json(result);
  } catch (e) { next(e); }
});


export default router;
