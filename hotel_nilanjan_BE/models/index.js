const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        timezone: '+05:30', // Set Sequelize to use IST
        logging: false,
    }
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Models
db.Lang = require('./Lang')(sequelize, DataTypes);
db.User = require('./User')(sequelize, DataTypes);
db.Product = require('./Product')(sequelize, DataTypes);
db.Order = require('./Order')(sequelize, DataTypes);
db.OrderHistory = require('./OrderHistory')(sequelize, DataTypes);
db.OrderItem = require('./OrderItem')(sequelize, DataTypes);
db.OrderItemHistory = require('./OrderItemHistory')(sequelize, DataTypes);

module.exports = db;
