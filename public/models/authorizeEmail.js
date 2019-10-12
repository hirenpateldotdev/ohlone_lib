const mongoose = require('mongoose');

// Schema/blueprin to handle email authentication input.
const emailSchema = mongoose.Schema({
	email: String
});

module.exports = mongoose.model('Email', emailSchema);