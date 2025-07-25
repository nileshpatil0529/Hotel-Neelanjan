const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        user_name: { type: DataTypes.STRING, unique: true, allowNull: false },
        password: { type: DataTypes.STRING, defaultValue: '12345' },
    });

    // Hash password before saving
    User.beforeCreate(async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    });

    // Ensure 'user' is inserted only when the table is created
    User.sync().then(async () => {
        const count = await User.count();
        if (count === 0) {
            await User.create({ user_name: 'Admin', password: '12345' });
        }
    });

    return User;
};
