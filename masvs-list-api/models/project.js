'use strict';

module.exports = (sequelize, DataTypes) => {
    const project = sequelize.define('project', {
       name: {  type: DataTypes.STRING(20), defaultValue: "NO_DATA" },
         description: { type: DataTypes.STRING(100), defaultValue: "NO_DATA" },
         external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
        state: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        freezeTableName: true
    });

    project.associate = function (models) {

        project.belongsTo(models.entity, {foreignKey: 'entity_id'});
        project.hasMany(models.project_question, { foreignKey: 'project_id', as: 'project_question' });
    };

    return project;
};