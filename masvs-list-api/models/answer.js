'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const answer = sequelize.define('answer', {
        state: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, {
        freezeTableName: true
    });
    answer.associate = function (models){
        answer.hasMani(models.account, {foreignKey: 'account_id'});
    }
    return answer;
};
