const { Op } = require('sequelize');
const { Order, OrderItem, OrderHistory } = require('../models');
const { createOrderItems } = require('../controllers/orderItemController');
const { emitEvent } = require('../services/websocketService');


// CREATE a new order
exports.createOrder = async (req, res) => {
    try {
        await Order.create(req.body.tableInfo);
        await createOrderItems(req, res);
        res.status(201).json({ msg: 'Order created sucessfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Print Bill on UI serive
exports.printBill = async (req, res) => {
    try {
        emitEvent('orderCreated', { bill_no: req.body.bill_no, print_for: req.body.print_for });
        res.status(201).json({ msg: 'Printed sucessfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// READ all orders
exports.getAllOrders = async (req, res) => {
    try {
        const table_no = req.query.table_no?.trim();
        const whereCondition = table_no ? { table_no } : {};
        const orders = await Order.findAll({ where: whereCondition });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// READ a single order by bill_no
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ where: { bill_no: req.params.bill_no } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Order-Item
exports.deleteOrderItem = async (req, res) => {
    try {
        const { bill_no, total, product_name, count } = req.body;
        const order = await Order.findOne({ where: { bill_no } });
        if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

        const orderItem = await OrderItem.findOne({ where: { bill_no, product_name } });
        if (!orderItem) return res.status(404).json({ success: false, error: 'Order item not found' });

        const newTotal = order.total - total;

        if (orderItem.quantity <= count) {
            // Remove item if quantity is 1 or less
            await OrderItem.destroy({ where: { bill_no, product_name } });
            if (newTotal <= 0) {
                await Order.destroy({ where: { bill_no } });
                return res.status(200).json({ success: true, message: 'Order deleted successfully' });
            } else {
                await Order.update({ total: newTotal }, { where: { bill_no } });
                return res.status(200).json({ success: true, message: 'Order updated successfully' });
            }
        } else {
            // Decrease quantity and update total
            await OrderItem.update({ quantity: orderItem.quantity - count }, { where: { bill_no, product_name } });
            await Order.update({ total: (order.total - (orderItem.product_price * count)) }, { where: { bill_no } });
            return res.status(200).json({ success: true, message: 'Order item quantity decreased successfully' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update order' });
    }
};

// Update Payment field only
exports.updatePayment = async (req, res) => {
    const { bill_no, payment } = req.body;
    if (typeof bill_no === 'undefined') {
        return res.status(400).json({ error: 'bill_no field is required' });
    }
    try {
        const updated = await Order.update(
            { payment },
            { where: { bill_no } }
        );
        if (updated[0] === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        return res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while updating the order' });
    }
};

// Update Pending Payment field only in History 
exports.updatePendingPayment = async (req, res) => {
    const { bill_no, payment } = req.body;
    if (typeof bill_no === 'undefined') {
        return res.status(400).json({ error: 'bill_no field is required' });
    }
    try {
        const updated = await OrderHistory.update(
            { payment },
            { where: { bill_no } }
        );
        if (updated[0] === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        return res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while updating the order' });
    }
};

// Shift Table
exports.shiftTabel = async (req, res) => {
    const { bill_no, shift_table } = req.body;
    if (typeof bill_no === 'undefined') {
        return res.status(400).json({ error: 'bill_no field is required' });
    }
    try {
        const updated = await Order.update(
            { table_no: shift_table },
            { where: { bill_no } }
        );
        if (updated[0] === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        return res.status(200).json({ message: 'Table shifted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while shift the table' });
    }
};

// merge Bills
exports.mergeBills = async (req, res) => {
    try {
        const { mergeBills, updatedBill_no } = req.body;
        if (!mergeBills || !updatedBill_no) return res.status(400).json({ error: 'mergeBills and updatedBill_no are required' });

        const billNos = mergeBills.map(b => b.bill_no);
        await Order.destroy({ where: { bill_no: { [Op.in]: billNos, [Op.ne]: updatedBill_no } } });
        await OrderItem.update({ bill_no: updatedBill_no }, { where: { bill_no: { [Op.in]: billNos } } });

        const items = await OrderItem.findAll({ where: { bill_no: updatedBill_no }, raw: true });
        const mergedItems = items.reduce((acc, item) => {
            const key = `${item.bill_no}-${item.product_name}`;
            acc[key] ? acc[key].quantity += item.quantity : acc[key] = { ...item };
            return acc;
        }, {});

        await OrderItem.destroy({ where: { bill_no: updatedBill_no } });
        await OrderItem.bulkCreate(Object.values(mergedItems));
        await Order.update({ total: Object.values(mergedItems).reduce((sum, i) => sum + (i.quantity * i.product_price), 0) }, { where: { bill_no: updatedBill_no } });

        res.status(200).json({ message: 'Bills merged successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while merging bills' });
    }
};

// Update Discount field only
exports.updateDiscount = async (req, res) => {
    const { bill_no, discount } = req.body;
    if (typeof bill_no === 'undefined' || typeof discount === 'undefined') {
        return res.status(400).json({ error: 'bill_no and discount fields are required' });
    }
    try {
        const updated = await Order.update(
            { discount },
            { where: { bill_no } }
        );
        if (updated[0] === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        return res.status(200).json({ message: 'Discount updated successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while updating the discount' });
    }
};
