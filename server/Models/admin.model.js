const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true
		},
		password: {
			type: String,
			required: true
		},
		role: {
			type: String,
			default: 'admin'
		},
		isBlocked: {
			type: Boolean,
			default: false
		},
		token: {
			type: String
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Admin',
			default: null
		},
		lastLogin: {
			type: Date
		}
	},
	{ timestamps: true }
);

adminSchema.methods.getSafeProfile = function getSafeProfile() {
	const obj = this.toObject();
	delete obj.password;
	delete obj.__v;
	return obj;
};

module.exports = mongoose.model('Admin', adminSchema);
