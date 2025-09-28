const MainCategory = require('../model/learnScreenSchema');

exports.addMainCategory = async (req, res) => {
    try {
        const { name, description, subCategorys } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const mainCategory = new MainCategory({
            name,
            description,
            mainCategoryimage: req.file ? req.file.filename : null,
            subCategorys: subCategorys || []
        });

        await mainCategory.save();

        res.status(201).json({
            success: true,
            message: 'Main category created successfully',
            data: mainCategory
        });

    } catch (error) {
        console.error('Add main category error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.    addSubCategory = async (req, res) => {
    try {
        const { mainCategoryId } = req.params;
        const { name, topics } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const mainCategory = await MainCategory.findById(mainCategoryId);
        if (!mainCategory) {
            return res.status(404).json({ success: false, message: 'Main category not found' });
        }

        mainCategory.subCategorys.push({
            name,
            topics: topics || []
        });

        await mainCategory.save();

        res.status(201).json({
            success: true,
            message: 'Sub category added successfully',
            data: mainCategory
        });

    } catch (error) {
        console.error('Add sub category error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.addTopic = async (req, res) => {
    try {
        const { mainCategoryId, subCategoryId } = req.params;
        const { name, entries } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const mainCategory = await MainCategory.findById(mainCategoryId);
        if (!mainCategory) {
            return res.status(404).json({ success: false, message: 'Main category not found' });
        }

        const subCategory = mainCategory.subCategorys.id(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'Sub category not found' });
        }

        subCategory.topics.push({
            name,
            entries: entries || []
        });

        await mainCategory.save();

        res.status(201).json({
            success: true,
            message: 'Topic added successfully',
            data: mainCategory
        });

    } catch (error) {
        console.error('Add topic error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.addEntry = async (req, res) => {
    try {
        const { mainCategoryId, subCategoryId, topicId } = req.params;
        const { title, body, footer } = req.body;

        if (!title || !body) {
            return res.status(400).json({ success: false, message: 'Title and body are required' });
        }

        const mainCategory = await MainCategory.findById(mainCategoryId);
        if (!mainCategory) {
            return res.status(404).json({ success: false, message: 'Main category not found' });
        }

        const subCategory = mainCategory.subCategorys.id(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'Sub category not found' });
        }

        const topic = subCategory.topics.id(topicId);
        if (!topic) {
            return res.status(404).json({ success: false, message: 'Topic not found' });
        }

        topic.entries.push({
            title,
            image: req.file ? req.file.filename : null,
            body,
            footer
        });

        await mainCategory.save();

        res.status(201).json({
            success: true,
            message: 'Entry added successfully',
            data: mainCategory
        });

    } catch (error) {
        console.error('Add entry error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getAllMainCategories = async (req, res) => {
    try {
        const mainCategories = await MainCategory.find({ deletedAt: null });

        res.status(200).json({
            success: true,
            data: mainCategories
        });

    } catch (error) {
        console.error('Get main categories error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getMainCategoryById = async (req, res) => {
    try {
        const { mainCategoryId } = req.params;
        const mainCategory = await MainCategory.findById(mainCategoryId);

        if (!mainCategory) {
            return res.status(404).json({ success: false, message: 'Main category not found' });
        }

        res.status(200).json({
            success: true,
            data: mainCategory
        });

    } catch (error) {
        console.error('Get main category error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getSubCategories = async (req, res) => {
    try {
        const { mainCategoryId } = req.params;
        const mainCategory = await MainCategory.findById(mainCategoryId);

        if (!mainCategory) {
            return res.status(404).json({ success: false, message: 'Main category not found' });
        }

        res.status(200).json({
            success: true,
            data: mainCategory.subCategorys
        });

    } catch (error) {
        console.error('Get sub categories error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getTopics = async (req, res) => {
    try {
        const { mainCategoryId, subCategoryId } = req.params;
        const mainCategory = await MainCategory.findById(mainCategoryId);

        if (!mainCategory) {
            return res.status(404).json({ success: false, message: 'Main category not found' });
        }

        const subCategory = mainCategory.subCategorys.id(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'Sub category not found' });
        }

        res.status(200).json({
            success: true,
            data: subCategory.topics
        });

    } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getEntries = async (req, res) => {
    try {
        const { mainCategoryId, subCategoryId, topicId } = req.params;
        const mainCategory = await MainCategory.findById(mainCategoryId);

        if (!mainCategory) {
            return res.status(404).json({ success: false, message: 'Main category not found' });
        }

        const subCategory = mainCategory.subCategorys.id(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'Sub category not found' });
        }

        const topic = subCategory.topics.id(topicId);
        if (!topic) {
            return res.status(404).json({ success: false, message: 'Topic not found' });
        }

        res.status(200).json({
            success: true,
            data: topic.entries
        });

    } catch (error) {
        console.error('Get entries error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};