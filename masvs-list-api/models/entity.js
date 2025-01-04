'use strict';
module.exports = (sequelize, DataTypes) => {
    const entity = sequelize.define('entity', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        state: { type: DataTypes.BOOLEAN, defaultValue: true },
        photo: { type: DataTypes.STRING(80), defaultValue: "NO_DATA" },
        first_name: { type: DataTypes.STRING(20), defaultValue: "NO_DATA" },
        last_name: { type: DataTypes.STRING(20), defaultValue: "NO_DATA" },
        birth_date: { type: DataTypes.DATE },
        phone: { type: DataTypes.STRING(20), defaultValue: "NO_DATA", unique: true }
    }, {
        freezeTableName: true
    });
    entity.associate = function (models) {
        entity.hasMany(models.role_entity, { foreignKey: 'entity_id', as: 'role_entity' });
        entity.hasOne(models.account, { foreignKey: 'entity_id', as: 'account' });
        entity.hasMany(models.project, { foreignKey: 'entity_id', as: 'project' });
    };

    return entity;
};