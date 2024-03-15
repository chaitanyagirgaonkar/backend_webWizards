import { Router } from "express";
import {
  createReport,
  updateReport,
  deleteReport,
  getUserReportById,
  getUserAllReport,
} from "../controllers/report.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/getAllreports")
      .get(getUserAllReport);

router.route("/create")
      .post(upload.single("pdfFile"), createReport);

router
  .route("/:reportId")
  .get(getUserReportById)
  .patch(upload.single("pdfFile"), updateReport)
  .delete(deleteReport);

export default router;
