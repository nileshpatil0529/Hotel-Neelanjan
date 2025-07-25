const { TEXT } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        product_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        product_name: { type: DataTypes.STRING, allowNull: false },
        marathi: { type: DataTypes.STRING, allowNull: true },
        image: { type: TEXT, allowNull: true },
        product_price: { type: DataTypes.FLOAT, allowNull: false },
        quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    });

    return Product;
};
