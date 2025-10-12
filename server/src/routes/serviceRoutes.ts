import { Router } from "express";
import * as serviceController from "../controllers/serviceController";

const router = Router();

router.get("/", async (req, res, next) => {
  try { res.json(await serviceController.getServices()); } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try { res.json(await serviceController.getService(Number(req.params.id))); } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try { res.status(201).json(await serviceController.createService(req.body)); } catch (e) { next(e); }
});

router.put("/:id", async (req, res, next) => {
  try { res.json(await serviceController.updateService(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try { await serviceController.deleteService(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); }
});

export default router;
