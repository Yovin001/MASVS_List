'use strict';
module.exports = (sequelize, DataTypes) => {
    const role_entity = sequelize.define('role_entity', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        status: {type: DataTypes.BOOLEAN, defaultValue: true}
    }, {freezeTableName: true});

    role_entity.associate = function (models) {
        role_entity.belongsTo(models.role, {foreignKey: 'role_id'});
        role_entity.belongsTo(models.entity, {foreignKey: 'entity_id'});
    }

    return role_entity;    
};