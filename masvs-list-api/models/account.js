'use strict';
module.exports = (sequelize, DataTypes) => {
    const account = sequelize.define('account', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        state: { type: DataTypes.ENUM("ACCEPTED", "DENIED", "PENDING"), defaultValue: "PENDING" },
        email: { type: DataTypes.STRING(50), allowNull: false, unique: true },
        password: { type: DataTypes.STRING(150), allowNull: false }
    }, {
        freezeTableName: true
    });

    account.associate = function (models) {
        account.belongsTo(models.entity, { foreignKey: 'entity_id' });
        account.hasOne(models.request, { foreignKey: 'account_id', as: 'request' });
    }

    return account;
};