'use strict';
module.exports = (sequelize, DataTypes) => {
    const project_question = sequelize.define('project_question', {
        state: {type: DataTypes.BOOLEAN, defaultValue: true}
    }, {freezeTableName: true,  timestamps: false });

    project_question.associate = function (models) {
        project_question.belongsTo(models.project, {foreignKey: 'project_id'});
        project_question.belongsTo(models.question, {foreignKey: 'question_id'});
    }

    return project_question;    
};