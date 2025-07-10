import { Router } from "express";
import homeController from "@controllers/homeController";

const router = Router();

router.get("/", homeController.getHome);

export default router;
