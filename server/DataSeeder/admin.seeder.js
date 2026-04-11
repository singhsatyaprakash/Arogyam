const bcrypt = require('bcrypt');
const path = require('path');
const connectDB = require('../Config/db');
const Admin = require('../Models/admin.model');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const ADMIN_NAME = String(process.env.ADMIN_NAME || 'Super Admin').trim();
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '');

(async function seedUniversalAdmin() {
	try {
		if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
			throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in server/.env');
		}

		await connectDB();
		console.log('Database connected for admin seeding.');

		const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

		const admin = await Admin.findOneAndUpdate(
			{ email: ADMIN_EMAIL },
			{
				$set: {
					name: ADMIN_NAME,
					email: ADMIN_EMAIL,
					password: hashedPassword,
					role: 'admin',
					isBlocked: false,
					token: null
				},
				$setOnInsert: {
					createdBy: null
				}
			},
			{
				upsert: true,
				new: true,
				setDefaultsOnInsert: true
			}
		);

		console.log(`Universal admin is ready: ${admin.email}`);
		process.exit(0);
	} catch (error) {
		console.error('Admin seeder error:', error.message || error);
		process.exit(1);
	}
})();
