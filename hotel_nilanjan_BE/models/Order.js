module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        bill_no: { type: DataTypes.BIGINT, primaryKey: true, allowNull: false },
        table_no: { type: DataTypes.STRING, allowNull: false },
        seller: { type: DataTypes.STRING, allowNull: false },
        payment: { type: DataTypes.STRING, defaultValue: 'running' },
        total: { type: DataTypes.FLOAT, allowNull: false },
        discount: { type: DataTypes.FLOAT, defaultValue: 0 },
    });

    return Order;
};
