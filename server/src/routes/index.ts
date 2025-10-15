import { Router } from "express";
import deskRoutes from "./deskRoutes";
import serviceRoutes from "./serviceRoutes";
import ticketRoutes from "./ticketRoutes";
import queueRoutes from "./queueRoutes"

const router = Router();

router.use("/desks", deskRoutes);
router.use("/services", serviceRoutes);
router.use("/tickets", ticketRoutes);
router.use("/queues",queueRoutes);

export default router;
