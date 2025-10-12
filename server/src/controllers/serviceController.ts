import { Router } from "express";
import { ServiceService } from "../services/ServiceService";

const router = Router();
const service = new ServiceService();

/** Helper: parse ?with=desks,tickets */
function parseRelations(q: unknown) {
  const withParam = String(q ?? "");
  return withParam
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s === "desks" || s === "tickets") as any;
}

/** GET /services?with=desks,tickets */
router.get("/", async (req, res, next) => {
  try {
    const data = await service.list(parseRelations(req.query.with));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/** GET /services/by-desk/:deskId?with=desks,tickets */
router.get("/by-desk/:deskId", async (req, res, next) => {
  try {
    const deskId = Number(req.params.deskId);
    const data = await service.listByDesk(deskId, parseRelations(req.query.with));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/** GET /services/:id?with=desks,tickets */
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = await service.get(id, parseRelations(req.query.with));
    res.json(data);
  } catch (e: any) {
    if (e?.name === "NotFoundError") return res.status(404).json({ error: e.message });
    next(e);
  }
});

/** POST /services  { name: string, estimatedTime: number, deskIds?: number[] } */
router.post("/", async (req, res, next) => {
  try {
    const { name, estimatedTime, deskIds } = req.body;
    const created = await service.create({ name, estimatedTime, deskIds });
    res.status(201).json(created);
  } catch (e: any) {
    if (e?.code === "DUPLICATE_NAME") return res.status(409).json({ error: e.message });
    next(e);
  }
});

/** PUT /services/:id { name?, estimatedTime?, deskIds?: number[] | null } */
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, estimatedTime, deskIds } = req.body;
    const updated = await service.update(id, { name, estimatedTime, deskIds });
    res.json(updated);
  } catch (e: any) {
    if (e?.name === "NotFoundError") return res.status(404).json({ error: e.message });
    if (e?.code === "DUPLICATE_NAME") return res.status(409).json({ error: e.message });
    next(e);
  }
});

/** DELETE /services/:id */
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
