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
        const mainCategories = await MainCategory.find({ deletedAt: null }).select("_id name description");

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
        const userId = req.user?._id; // Get user ID from auth middleware if available

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

        // Transform entries to include user-specific read status
        const entriesWithReadStatus = topic.entries.map(entry => {
            const entryObj = entry.toObject();
            // Check if this user has read this entry
            const readStatus = entry.readBy.find(read => read.userId.toString() === userId.toString());
            
            // Add read status to entry object
            entryObj.isRead = !!readStatus;
            entryObj.readAt = readStatus ? readStatus.readAt : null;
            
            // Remove readBy array from response to keep it clean
            delete entryObj.readBy;
            
            return entryObj;
        });

        res.status(200).json({
            success: true,
            data: entriesWithReadStatus
        });

    } catch (error) {
        console.error('Get entries error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Mark entry as read
exports.markEntryAsRead = async (req, res) => {
    try {
        const { mainCategoryId, subCategoryId, topicId, entryId } = req.params;
        
        // Check if user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const userId = req.user._id;

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

        const entry = topic.entries.id(entryId);
        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }

        // Check if user has already read this entry
        const alreadyRead = entry.readBy.some(read => read.userId.toString() === userId.toString());
        
        if (!alreadyRead) {
            // Add user to readBy array
            entry.readBy.push({ userId });
            await mainCategory.save();
        }

        res.status(200).json({
            success: true,
            message: 'Entry marked as read'
        });

    } catch (error) {
        console.error('Mark entry as read error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Cross-category search - search across different main categories
exports.crossCategorySearch = async (req, res) => {
    try {
        const { query, page = 1, limit = 10, targetMainCategoryId } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Search query is required' 
            });
        }

        // Helper function to highlight search text
        const highlightSearchText = (text, searchQuery) => {
            if (!searchQuery || !text) return text;
            
            const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        };

        let searchResults = [];

        if (targetMainCategoryId) {
            // Search in specific main category
            const targetMainCategory = await MainCategory.findById(targetMainCategoryId);
            if (!targetMainCategory) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Target main category not found' 
                });
            }

            // Search through all subcategories, topics, and entries in the target main category
            targetMainCategory.subCategorys.forEach(subCategory => {
                subCategory.topics.forEach(topic => {
                    topic.entries.forEach(entry => {
                        if (entry.deletedAt === null && 
                            (entry.title.toLowerCase().includes(query.toLowerCase()) ||
                             entry.body.toLowerCase().includes(query.toLowerCase()))) {
                            
                            searchResults.push({
                                _id: entry._id,
                                title: entry.title,
                                highlightedTitle: highlightSearchText(entry.title, query),
                                body: entry.body,
                                highlightedBody: highlightSearchText(entry.body, query),
                                image: entry.image,
                                footer: entry.footer,
                                createdAt: entry.createdAt,
                                updatedAt: entry.updatedAt,
                                mainCategory: {
                                    _id: targetMainCategory._id,
                                    name: targetMainCategory.name
                                },
                                subCategory: {
                                    _id: subCategory._id,
                                    name: subCategory.name
                                },
                                topic: {
                                    _id: topic._id,
                                    name: topic.name
                                }
                            });
                        }
                    });
                });
            });
        } else {
            // Search across all main categories
            const allMainCategories = await MainCategory.find({});
            
            allMainCategories.forEach(mainCategory => {
                mainCategory.subCategorys.forEach(subCategory => {
                    subCategory.topics.forEach(topic => {
                        topic.entries.forEach(entry => {
                            if (entry.deletedAt === null && 
                                (entry.title.toLowerCase().includes(query.toLowerCase()) ||
                                 entry.body.toLowerCase().includes(query.toLowerCase()))) {
                                
                                searchResults.push({
                                    _id: entry._id,
                                    title: entry.title,
                                    highlightedTitle: highlightSearchText(entry.title, query),
                                    body: entry.body,
                                    highlightedBody: highlightSearchText(entry.body, query),
                                    image: entry.image,
                                    footer: entry.footer,
                                    createdAt: entry.createdAt,
                                    updatedAt: entry.updatedAt,
                                    mainCategory: {
                                        _id: mainCategory._id,
                                        name: mainCategory.name
                                    },
                                    subCategory: {
                                        _id: subCategory._id,
                                        name: subCategory.name
                                    },
                                    topic: {
                                        _id: topic._id,
                                        name: topic.name
                                    }
                                });
                            }
                        });
                    });
                });
            });
        }

        // Sort by relevance (exact matches first, then partial matches)
        searchResults.sort((a, b) => {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();
            const searchQuery = query.toLowerCase();
            
            // Exact match gets highest priority
            if (aTitle === searchQuery && bTitle !== searchQuery) return -1;
            if (bTitle === searchQuery && aTitle !== searchQuery) return 1;
            
            // Starts with query gets second priority
            if (aTitle.startsWith(searchQuery) && !bTitle.startsWith(searchQuery)) return -1;
            if (bTitle.startsWith(searchQuery) && !aTitle.startsWith(searchQuery)) return 1;
            
            // Alphabetical order for other matches
            return aTitle.localeCompare(bTitle);
        });

        // Apply pagination
        const totalResults = searchResults.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedResults = searchResults.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            data: {
                results: paginatedResults,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalResults / limit),
                    totalResults,
                    hasNext: endIndex < totalResults,
                    hasPrev: page > 1
                },
                searchQuery: query,
                targetMainCategory: targetMainCategoryId ? { _id: targetMainCategoryId } : null
            }
        });

    } catch (error) {
        console.error('Cross category search error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.searchEntriesInTopic = async (req, res) => {
    try {
        const { mainCategoryId, subCategoryId, topicId } = req.params;
        const { query, page = 1, limit = 10 } = req.query;

        if (!query || query.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Search query is required' 
            });
        }

        // Find the specific topic
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

        // Helper function to highlight search text
        const highlightSearchText = (text, searchQuery) => {
            if (!searchQuery || !text) return text;
            
            const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        };

        // Search for entries with title matching the query within this specific topic
        const searchResults = [];
        
        topic.entries.forEach(entry => {
            if (entry.deletedAt === null && 
                entry.title.toLowerCase().includes(query.toLowerCase())) {
                
                searchResults.push({
                    _id: entry._id,
                    title: entry.title,
                    highlightedTitle: highlightSearchText(entry.title, query),
                    image: entry.image,
                    body: entry.body,
                    footer: entry.footer,
                    createdAt: entry.createdAt,
                    updatedAt: entry.updatedAt
                });
            }
        });

        // Sort by relevance (exact matches first, then partial matches)
        searchResults.sort((a, b) => {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();
            const searchQuery = query.toLowerCase();
            
            // Exact match gets highest priority
            if (aTitle === searchQuery && bTitle !== searchQuery) return -1;
            if (bTitle === searchQuery && aTitle !== searchQuery) return 1;
            
            // Starts with query gets second priority
            if (aTitle.startsWith(searchQuery) && !bTitle.startsWith(searchQuery)) return -1;
            if (bTitle.startsWith(searchQuery) && !aTitle.startsWith(searchQuery)) return 1;
            
            // Alphabetical order for other matches
            return aTitle.localeCompare(bTitle);
        });

        // Apply pagination
        const totalResults = searchResults.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedResults = searchResults.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            data: {
                results: paginatedResults,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalResults / limit),
                    totalResults,
                    hasNext: endIndex < totalResults,
                    hasPrev: page > 1
                },
                searchQuery: query,
                topic: {
                    _id: topic._id,
                    name: topic.name
                }
            }
        });

    } catch (error) {
        console.error('Search entries in topic error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};