'use strict';
module.exports = (sequelize, DataTypes) => {
    const role = sequelize.define('role', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 ,unique: true},
        status: {type: DataTypes.BOOLEAN, defaultValue: true},
        name: {type: DataTypes.STRING(20), defaultValue: "NO_DATA"}
    }, {
        freezeTableName: true
    });
    role.associate = function (models){
        role.hasOne(models.role_entity, { foreignKey: 'role_id', as: 'role_entity'});
    };
 
    return role;
};