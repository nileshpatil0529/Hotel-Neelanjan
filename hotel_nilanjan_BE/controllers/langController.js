const { Lang } = require('../models');
// --------- available in Orders Router -------------------
// Update language
exports.changeLang = async (req, res) => {
    const { lang } = req.body;
    try {
        await Lang.update({ lang }, { where: {} });
        res.status(200).json({ message: 'Language updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update language' });
    }
};

// Get language
exports.getLang = async (req, res) => {
    try {
        const langRecord = await Lang.findOne();
        res.status(200).json({ lang: langRecord ? langRecord.lang : 'all' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch language' });
    }
};