'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const request = sequelize.define('request', {
        request: { type: DataTypes.STRING(300), defaultValue: "NO_DATA" },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        status: {type: DataTypes.ENUM('ES', 'AC', 'RE'), defaultValue: 'ES'},
        type: {type: DataTypes.ENUM('RI', 'CC'), defaultValue: 'RI'}, //RI: Registration of entry, CC: Password change
        rejection_reason: { type: DataTypes.STRING(300), defaultValue: "NO_DATA" },
        approver_rejector_id: { type: DataTypes.INTEGER, allowNull: true }
    }, {
        freezeTableName: true
    });
    request.associate = function (models){
        request.belongsTo(models.account, {foreignKey: 'account_id'});
    }
    return request;
};
