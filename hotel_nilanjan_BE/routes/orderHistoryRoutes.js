const express = require('express');
const router = express.Router();
const { moveOrderToHistory, orderFilteredData, getOrderItemsHistByBillNo } = require('../controllers/orderHistoryController');

// Routes for orders
router.get('/:bill_no', getOrderItemsHistByBillNo);
router.post('/filter', orderFilteredData);
router.post('/', moveOrderToHistory);

module.exports = router;
