import { Router } from "express";
import { DeskService } from "../services/DeskService";

const router = Router();
const service = new DeskService();

/** GET /desks?with=services,tickets */
router.get("/", async (req, res, next) => {
  try {
    const withParam = String(req.query.with || "");
    const relations = withParam
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s === "services" || s === "tickets") as any;

    const data = await service.list(relations);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/** GET /desks/by-service/:serviceId?with=services,tickets */
router.get("/by-service/:serviceId", async (req, res, next) => {
  try {
    const serviceId = Number(req.params.serviceId);
    const withParam = String(req.query.with || "");
    const relations = withParam
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s === "services" || s === "tickets") as any;

    const data = await service.listByService(serviceId, relations);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/** GET /desks/:id?with=services,tickets */
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const withParam = String(req.query.with || "");
    const relations = withParam
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s === "services" || s === "tickets") as any;

    const data = await service.get(id, relations);
    res.json(data);
  } catch (e: any) {
    if (e?.name === "NotFoundError") return res.status(404).json({ error: e.message });
    next(e);
  }
});

/** POST /desks  { name, serviceIds?: number[] } */
router.post("/", async (req, res, next) => {
  try {
    const { name, serviceIds } = req.body;
    const created = await service.create({ name, serviceIds });
    res.status(201).json(created);
  } catch (e: any) {
    if (e?.code === "DUPLICATE_NAME") return res.status(409).json({ error: e.message });
    next(e);
  }
});

/** PUT /desks/:id  { name?, serviceIds?: number[] | null } */
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, serviceIds } = req.body;
    const updated = await service.update(id, { name, serviceIds });
    res.json(updated);
  } catch (e: any) {
    if (e?.name === "NotFoundError") return res.status(404).json({ error: e.message });
    if (e?.code === "DUPLICATE_NAME") return res.status(409).json({ error: e.message });
    next(e);
  }
});

/** DELETE /desks/:id */
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

/** Call the next ticket for a desk
 * Returns the ticket details or null if no ticket is waiting
 */
export async function callNext(deskId: number) {
  return null; // TODO
}
