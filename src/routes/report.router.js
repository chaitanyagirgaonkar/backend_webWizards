import { Router } from "express";
import {
  createReport,
  updateReport,
  deleteReport,
  getUserReportById,
  getUserAllReport,
  sendPatientReports,
  sendEmail,
  sendSingleReport
} from "../controllers/report.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
// router.use(verifyJWT);

router.route("/getAllreports")
  .get(verifyJWT, getUserAllReport);

router.route("/create")
  .post(upload.single("pdfFile"), verifyJWT, createReport);

router
  .route("/:reportId")
  .get(verifyJWT, getUserReportById)
  .patch(upload.single("pdfFile"), verifyJWT, updateReport)
  .delete(verifyJWT, deleteReport)


router
  .route("/user/:userId")
  .get(sendPatientReports)

router
  .route('/email/:reportId')
  .post(verifyJWT, sendEmail)

router
  .route("/report/:reportId")
  .get(sendSingleReport)

export default router;
