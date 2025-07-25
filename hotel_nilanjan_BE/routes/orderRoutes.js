const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { getOrderItemsByBillNo, deleteOrderByBillNo } = require('../controllers/orderItemController');

// Routes for orders
router.get('/', orderController.getAllOrders); // Read all orders
router.get('/:bill_no', getOrderItemsByBillNo); // Get order items by bill_no
router.post('/delete-order', deleteOrderByBillNo); // Delete order items by bill_no
router.post('/', orderController.createOrder); // Create order
router.post('/print-bill', orderController.printBill); // Print Bill
router.post('/remove-item', orderController.deleteOrderItem); // Delete Item
router.put('/merge', orderController.mergeBills); // Merge bills
router.put('/shift-table', orderController.shiftTabel); // Shift Table
router.put('/', orderController.updatePayment); // Update payment
router.put('/update-due', orderController.updatePendingPayment); // Update payment
router.put('/discount', orderController.updateDiscount); // Update discount

module.exports = router;
