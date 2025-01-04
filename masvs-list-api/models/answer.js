'use strict';
const { UUIDV4 } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    const answer = sequelize.define('answer', {
        state: { type: DataTypes.BOOLEAN, defaultValue: false },
    }, {
        freezeTableName: true
    });
    answer.associate = function (models){
        answer.hasMany(models.account, {foreignKey: 'account_id'});
    }
    return answer;
};
