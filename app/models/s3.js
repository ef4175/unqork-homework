const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    account_id: {
        type: String,
        required: true,
    },
    versioning: {
        type: Boolean,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
    modified: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('S3', schema);
