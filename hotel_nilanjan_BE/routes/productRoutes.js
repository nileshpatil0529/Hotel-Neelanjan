const express = require('express');
const upload = require('./multerConfig');

const { createNupdateProduct, getAllProducts, deleteProduct } = require('../controllers/productController');
const { getLang, changeLang } = require('../controllers/langController');
// const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getAllProducts);
router.post('/', upload.single('image'), createNupdateProduct);
router.put('/', upload.single('image'), createNupdateProduct);
router.delete('/:id', deleteProduct);
router.get('/get-lang', getLang);
router.put('/change-lang', changeLang);

module.exports = router;
