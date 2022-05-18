const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');
//const Schema   = mongoose.Schema

const UserSchema = new mongoose.Schema({
	Email: { 
		type     : String, 
		required : true,
		unique   : true
	},
	MagicLink: { 
		type     : String, 
		required : false,
		unique   : false,
		default  : uuidv4
	},
	MagicLinkExpired: { 
		type     : Boolean, 
		default  : false
	}
},
{strictQuery: false}
)

const Magic = mongoose.model('Magic', UserSchema)
module.exports = Magic