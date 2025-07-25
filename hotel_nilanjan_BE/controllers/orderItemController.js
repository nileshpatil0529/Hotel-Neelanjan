const { OrderItem, Order } = require('../models');

// CREATE multiple order items
exports.createOrderItems = async (req, res) => {
    try {
        await OrderItem.bulkCreate(req.body.productDetails);
        return res;
    } catch (error) {
        console.log('error in createOrderItems');
    }
};

// READ order All items by bill_no
exports.getOrderItemsByBillNo = async (req, res) => {
    try {
        const orderItems = await OrderItem.findAll({ where: { bill_no: req.params.bill_no } });
        const order = await Order.findOne({ where: { bill_no: req.params.bill_no } });
        const mergeBills  = await Order.findAll({ where: { table_no: order.table_no || 0 }, attributes: ['bill_no'] });
        const orderWithMergable = { ...order.dataValues, mergeBills };
        
        if (!orderItems.length) {
            return res.status(404).json({ message: 'No order items found for this bill number' });
        }
        res.status(200).json({orderItems, order: orderWithMergable});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Order by bill_no
exports.deleteOrderByBillNo = async (req, res) => {
    try {
        const { bill_no } = req.body;
        const order = await Order.findOne({ where: { bill_no } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        await OrderItem.destroy({ where: { bill_no } });
        await Order.destroy({ where: { bill_no } });
        res.status(200).json({ message: 'Order and its items deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE an order item
exports.updateOrderItem = async (req, res) => {
    try {
        const [updated] = await OrderItem.update(req.body, {
            where: { id: req.params.id }
        });
        if (!updated) {
            return res.status(404).json({ message: 'Order item not found' });
        }
        const updatedOrderItem = await OrderItem.findOne({ where: { id: req.params.id } });
        res.status(200).json(updatedOrderItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE an order item
exports.deleteOrderItem = async (req, res) => {
    try {
        const deleted = await OrderItem.destroy({
            where: { id: req.params.id }
        });
        if (!deleted) {
            return res.status(404).json({ message: 'Order item not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
