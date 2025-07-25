const { Op } = require('sequelize');
const { Order, OrderHistory, OrderItem, OrderItemHistory } = require('../models');

exports.moveOrderToHistory = async (req, res) => {
    const { bill_no } = req.body;

    try {
        const transaction = await Order.sequelize.transaction();

        try {
            const orders = await Order.findAll({ where: { bill_no } });
            if (orders.length > 0) {
                const orderHistoryData = orders.map(order => ({
                    ...order.toJSON(), // Clone all fields
                    createdAt: order.createdAt, // Ensure timestamps match
                    updatedAt: order.updatedAt,
                }));
                await OrderHistory.bulkCreate(orderHistoryData, { transaction });
                await Order.destroy({ where: { bill_no }, transaction });
            }
            const orderItems = await OrderItem.findAll({ where: { bill_no } });
            if (orderItems.length > 0) {
                const orderItemHistoryData = orderItems.map(item => ({
                    ...item.toJSON(), // Clone all fields
                    createdAt: item.createdAt, // Ensure timestamps match
                    updatedAt: item.updatedAt,
                }));
                await OrderItemHistory.bulkCreate(orderItemHistoryData, { transaction });
                await OrderItem.destroy({ where: { bill_no }, transaction });
            }
            await transaction.commit();
            res.status(200).json({ message: 'Rows moved to history successfully.' });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error moving rows to history:', error);
        res.status(500).json({ error: 'An error occurred while moving rows to history.' });
    }
};

exports.orderFilteredData = async (req, res) => {
    try {
        const { table_no, seller, payment, fromDate, toDate } = req.body;
        const conditions = {};
        if (table_no) {
            conditions.table_no = table_no;
        }
        if (seller) {
            conditions.seller = seller;
        }
        if (payment) {
            conditions.payment = payment;
        }
        if (fromDate && toDate) {
            const startOfFromDate = new Date(fromDate);
            startOfFromDate.setHours(0, 0, 0, 0); // Set to start of the day

            const endOfToDate = new Date(toDate);
            endOfToDate.setHours(0, 0, 0, 0); // Set to end of the day

            conditions.createdAt = {
                [Op.between]: [startOfFromDate, endOfToDate],
            };
        }
        const orderHistories = await OrderHistory.findAll({ where: conditions });
        res.status(200).json(orderHistories);
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getOrderItemsHistByBillNo = async (req, res) => {
    try {
        const orderItems = await OrderItemHistory.findAll({ where: { bill_no: req.params.bill_no } });
        const order = await OrderHistory.findOne({ where: { bill_no: req.params.bill_no } });
        const mergeBills  = await OrderHistory.findAll({ where: { table_no: order.table_no }, attributes: ['bill_no'] });
        const orderWithMergable = { ...order.dataValues, mergeBills };
        
        if (!orderItems.length) {
            return res.status(404).json({ message: 'No order items found for this bill number' });
        }
        res.status(200).json({orderItems, order: orderWithMergable});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
