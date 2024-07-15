import { Router } from "express";
import {
  checkWishesStatus,
  getResult,
  handleNotFound,
  prepareWishes,
} from "../controllers/wishController";

const router = Router();

router.post("/prepare-wishes", prepareWishes);
router.get("/check-wishes-status/:uuid", checkWishesStatus);
router.get("/get-result/:uuid", getResult);

router.use(handleNotFound);

export default router;
