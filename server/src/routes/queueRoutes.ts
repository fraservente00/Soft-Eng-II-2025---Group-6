import { Router } from "express";
import queueService from "../services/queueService";

const router = Router();

//GET /api/queues/:ids

router.get("/:id",async (req,res,next) => {
    try{queueService.init();res.json( queueService.getQueuePerId(Number(req.params.id)));} catch(e) {next(e);}
});

console.log("[ROUTES] queueRoutes stack:", router.stack.map(r => r.route?.path));

export default router