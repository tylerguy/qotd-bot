module.exports = (sequelize, Sequelize) => {
    return sequelize.define('Qotd', {
        Question: {
            type: Sequelize.TEXT,
        },
        Submitter: {
            type: Sequelize.TEXT,
        },
    }, {
        freezeTableName: true,
        timestamps: false
    })
}