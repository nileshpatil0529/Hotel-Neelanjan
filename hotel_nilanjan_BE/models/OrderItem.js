module.exports = (sequelize, DataTypes) => {
    const OrderItem = sequelize.define('OrderItem', {
        bill_no: { type: DataTypes.BIGINT, allowNull: false, },
        product_name: { type: DataTypes.STRING, allowNull: false },
        marathi: { type: DataTypes.STRING, allowNull: true },
        product_price: { type: DataTypes.FLOAT, allowNull: false },
        tip: { type: DataTypes.STRING, allowNull: true },
        quantity: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'order_items', timestamps: false });

    return OrderItem;
};
