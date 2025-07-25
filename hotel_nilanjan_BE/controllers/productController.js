const fs = require('fs');
const path = require('path');
const db = require('../models');
const Product = db.Product;

// Create or Update Product
exports.createNupdateProduct = async (req, res) => {
    try {
        const { product_id, marathi, product_name, product_price } = req.body;
        if (!product_name || !product_price) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        let imagePath = null;
        if (req.file) {
            const fileSize = req.file.size; // File size in bytes
            const fileType = path.extname(req.file.originalname).toLowerCase(); // File extension
            if (fileSize > 2 * 1024 * 1024) { // 2 MB in bytes
                fs.unlinkSync(req.file.path); // Delete the uploaded file
                return res.status(400).json({ message: 'Image size should not exceed 2 MB.' });
            }
            const allowedTypes = ['.jpg', '.jpeg', '.png'];
            if (!allowedTypes.includes(fileType)) {
                fs.unlinkSync(req.file.path); // Delete the uploaded file
                return res.status(400).json({ message: 'Invalid file type. Only JPEG, JPG, and PNG are allowed.' });
            }

            imagePath = `/assets/uploads/${req.file.filename}`; // Store relative path of the image
        }
        const newProduct = {
            product_name,
            product_price: parseFloat(product_price),
            marathi,
            ...(imagePath && { image: imagePath }), // Only update image if a new one is uploaded
        };
        let resMsg = '';
        if (product_id) {
            await Product.update(newProduct, { where: { product_id } });
            resMsg = 'Product updated successfully';
        } else {
            await Product.create(newProduct);
            resMsg = 'Product created successfully';
        }
        res.status(201).json({ message: resMsg });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred.', error: err.message });
    }
};


// Get All Products
exports.getAllProducts = async (req, res) => {
    try {
        // Fetch all products
        const products = await Product.findAll();

        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'No products found.' });
        }

        // Return the list of products
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred.', error: err.message });
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await Product.destroy({ where: { product_id: id } });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

