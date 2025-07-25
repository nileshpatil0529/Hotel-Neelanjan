module.exports = (sequelize, DataTypes) => {
    const Lang = sequelize.define('Lang', {
        lang: { type: DataTypes.STRING, defaultValue: 'all' },
    }, { tableName: 'langs', timestamps: false });

    // Ensure 'all' is inserted only when the table is created
    Lang.sync().then(async () => {
        const count = await Lang.count();
        if (count === 0) {
            await Lang.create({ lang: 'all' });
        }
    });

    return Lang;
};