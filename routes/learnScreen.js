const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const learnScreen = require('../controller/learnScreen');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({ storage });

router.post('/main-category', upload.single('mainCategoryimage'), learnScreen.addMainCategory);
router.post('/sub-category/:mainCategoryId', learnScreen.addSubCategory);
router.post('/topic/:mainCategoryId/:subCategoryId', learnScreen.addTopic);
router.post('/entry/:mainCategoryId/:subCategoryId/:topicId', upload.single('image'), learnScreen.addEntry);

router.get('/main-categories', learnScreen.getAllMainCategories);
router.get('/main-category/:mainCategoryId', learnScreen.getMainCategoryById);
router.get('/main-category/:mainCategoryId/sub-categories', learnScreen.getSubCategories);
router.get('/main-category/:mainCategoryId/sub-category/:subCategoryId/topics', learnScreen.getTopics);
router.get('/main-category/:mainCategoryId/sub-category/:subCategoryId/topic/:topicId/entries', learnScreen.getEntries);

module.exports = router;