let mongoose = require('mongoose');

const mongdodb_url = 'mongodb+srv://admin:admin@product-hkdj8.mongodb.net/test?retryWrites=true&w=majority';
//const mongdodb_url = 'mongodb://localhost:27017/test';

class Database {
    constructor() {
        this._connect();
    }

    _connect() {
        mongoose.connect(mongdodb_url, {useUnifiedTopology: true, useNewUrlParser: true})
        .then(() => {
            console.log('Database connection successfully!');
        })
        .catch(err => {
            console.log('Database connection error!');
        })
    }
}

module.exports = new Database();