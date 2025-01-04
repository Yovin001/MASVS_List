'use strict';
module.exports = (sequelize, DataTypes) => {
    const type_question = sequelize.define('type_question', {
        state: { type: DataTypes.BOOLEAN, defaultValue: true },
        name: { type: DataTypes.STRING(20), defaultValue: "NO_DATA" },
    }, {
        freezeTableName: true
    });
    type_question.associate = function (models) {
        type_question.hasMany(models.question, { foreignKey: 'type_question_id', as: 'question' });
    };

    return type_question;
};
