const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const learnScreen = require("../controller/learnScreen");
const { authenticateToken } = require("../middlewares/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/main-category",
  upload.single("mainCategoryimage"),
  learnScreen.addMainCategory
);
router.post("/sub-category/:mainCategoryId", learnScreen.addSubCategory);
router.post("/topic/:mainCategoryId/:subCategoryId", learnScreen.addTopic);
router.post(
  "/entry/:mainCategoryId/:subCategoryId/:topicId",
  upload.single("image"),
  learnScreen.addEntry
);

router.get(
  "/main-categories",
  authenticateToken,
  learnScreen.getAllMainCategories
);
router.get(
  "/main-category/:mainCategoryId",
  authenticateToken,
  learnScreen.getMainCategoryById
);
router.get(
  "/main-category/:mainCategoryId/sub-categories",
  authenticateToken,
  learnScreen.getSubCategories
);
router.get(
  "/main-category/:mainCategoryId/sub-category/:subCategoryId/topics",
  authenticateToken,
  learnScreen.getTopics
);
router.get(
  "/main-category/:mainCategoryId/sub-category/:subCategoryId/topic/:topicId/entries",
  authenticateToken,
  learnScreen.getEntries
);

// Search entries by title within a specific topic
router.get(
  "/main-category/:mainCategoryId/sub-category/:subCategoryId/topic/:topicId/search",
  authenticateToken,
  learnScreen.searchEntriesInTopic
);

// Cross-category search - search across different main categories
router.get(
  "/search/cross-category",
  authenticateToken,
  learnScreen.crossCategorySearch
);

// Mark entry as read
router.post(
  "/main-category/:mainCategoryId/sub-category/:subCategoryId/topic/:topicId/entry/:entryId/mark-read",
  authenticateToken,
  learnScreen.markEntryAsRead
);

module.exports = router;