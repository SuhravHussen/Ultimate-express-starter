import { Router } from "express";
import homeRoutes from "@routes/homeRoutes";
import docsRoutes from "@routes/docsRoutes";

const router = Router();

// Mount routes
router.use("/", homeRoutes);
router.use("/docs", docsRoutes);

// Add more routes here as needed
// router.use('/api/users', userRoutes);
// router.use('/api/auth', authRoutes);

export default router;
