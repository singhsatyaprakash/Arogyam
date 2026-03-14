const bcrypt = require('bcrypt');
const connectDB = require('../Config/db');
const Patient = require('../Models/patient.model');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ...simple random helpers...
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sampleMany = (arr, n) => {
	const copy = [...arr];
	const out = [];
	n = Math.min(n, copy.length);
	for (let i = 0; i < n; i++) out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
	return out;
};

// Configuration
const COUNT = parseInt(process.env.SEED_COUNT, 10) || 100;
const BLOCKED_PERCENT = parseFloat(process.env.PATIENT_BLOCKED_PERCENT || '0.02'); // 2% blocked
const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || 'Password123!';

const FIRST_NAMES = ['Olivia','Liam','Emma','Noah','Ava','William','Sophia','James','Isabella','Oliver','Anil','Ravi','Priya','Neha','Asha'];
const LAST_NAMES = ['Smith','Johnson','Kumar','Patel','Sharma','Reddy','Iyer','Singh','Kaur','Nair','Mehta','Chatterjee','Brown','Wilson'];
const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const GENDERS = ['male','female','other'];

const usedEmails = new Set();

(async function seed() {
	try {
		await connectDB();
		console.log('Database connected for patient seeding.');

		const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
		const patients = [];

		for (let i = 1; i <= COUNT; i++) {
			const firstName = sample(FIRST_NAMES);
			const lastName = sample(LAST_NAMES);
			const name = `${firstName} ${lastName}`;

			let baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
			let email = `${baseEmail}@example.com`;
			let suffix = 1;
			while (usedEmails.has(email)) {
				suffix += 1;
				email = `${baseEmail}${suffix}@example.com`;
			}
			usedEmails.add(email);

			const phone = `9${randInt(100000000, 999999999)}`.slice(0, 10);
			const age = randInt(1, 90);
			const gender = sample(GENDERS);
			const bloodGroup = sample(BLOOD_GROUPS);
			const allergies = Math.random() < 0.3 ? sampleMany(['Pollen','Dust','Peanuts','Seafood','Lactose'], randInt(1,2)) : [];
			const existingConditions = Math.random() < 0.25 ? sampleMany(['Diabetes','Hypertension','Asthma','Thyroid','None'], randInt(1,2)) : [];

			patients.push({
				name,
				email,
				phone,
				password: hashedPassword,
				age,
				gender,
				bloodGroup,
				allergies,
				existingConditions,
				profileImage: '',
				isBlocked: false,
				token: null
			});
		}

		// mark a few as blocked
		const blockedCount = Math.max(1, Math.floor(COUNT * BLOCKED_PERCENT));
		for (let i = 0; i < blockedCount; i++) {
			const idx = Math.floor(Math.random() * patients.length);
			patients[idx].isBlocked = true;
		}

		await Patient.insertMany(patients, { ordered: false }).catch(err => {
			console.warn('Partial insert error (some patients may already exist):', err.message || err);
		});

		console.log(`Patient seeder finished. Attempted: ${COUNT}, Blocked marked: ${blockedCount}`);
		process.exit(0);
	} catch (err) {
		console.error('Patient seeder error:', err);
		process.exit(1);
	}
})();
