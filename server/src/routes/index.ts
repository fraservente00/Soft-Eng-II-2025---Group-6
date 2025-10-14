import { Router } from "express";
import deskRoutes from "./deskRoutes";
import serviceRoutes from "./serviceRoutes";
import ticketRoutes from "./ticketRoutes";

const router = Router();

router.use("/desks", deskRoutes);
//router.use("/services", serviceRoutes);
//router.use("/tickets", ticketRoutes);

export default router;
