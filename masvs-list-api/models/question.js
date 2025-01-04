'use strict';
module.exports = (sequelize, DataTypes) => {
    const question = sequelize.define('question', {
        state: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        freezeTableName: true
    });
    question.associate = function (models) {
        question.hasMany(models.project_question, { foreignKey: 'question_id', as: 'project_question' });
        question.belongsTo(models.type_question, {foreignKey: 'type_question_id'});
    };

    return question;
};
