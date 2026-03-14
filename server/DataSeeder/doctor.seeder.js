const bcrypt = require('bcrypt');
const connectDB = require('../Config/db');
const Doctor = require('../Models/doctor.model');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Simple random helpers
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sampleMany = (arr, n) => {
	const copy = [...arr];
	const out = [];
	n = Math.min(n, copy.length);
	for (let i = 0; i < n; i++) out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
	return out;
};

// Configuration (env or defaults)
const COUNT = parseInt(process.env.SEED_COUNT, 10) || 50;
const UNVERIFIED_PERCENT = parseFloat(process.env.UNVERIFIED_PERCENT || '0.05'); // 5% unverified by default
const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || 'deepasingh';

const SPECIALIZATIONS = [
	'General Physician','Cardiologist','Dermatologist','Psychiatrist','Pediatrician',
	'Neurologist','Orthopedic','Gynecologist','Endocrinologist','ENT'
];
const QUALIFICATIONS = ['MBBS','MD','DO','DNB','MS','PhD','FCPS'];
const LANGUAGES = ['English','Hindi','Spanish','French','Tamil','Telugu','Bengali'];

// Add realistic name pools
const FIRST_NAMES = [
	'John','Michael','David','James','Robert','Mary','Patricia','Linda','Barbara','Elizabeth',
	'Anil','Ravi','Suresh','Priya','Asha','Kavya','Neha','Arjun','Vikram','Sanaa'
];
const LAST_NAMES = [
	'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
	'Patel','Sharma','Reddy','Iyer','Khan','Singh','Kaur','Nair','Mehta','Chatterjee'
];

const usedEmails = new Set();

// 24-hour time formatter: HH:mm (matches frontend time inputs)
const formatTime24 = (hour, minute = 0) =>
	`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

(async function seed() {
	try {
		// Connect DB
		await connectDB();
        console.log('Database connected for seeding.');
		// Pre-hash a password once for speed
		const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

		const doctors = [];
		for (let i = 1; i <= COUNT; i++) {
			// generate realistic random name
			const firstName = sample(FIRST_NAMES);
			const lastName = sample(LAST_NAMES);
			const name = `Dr. ${firstName} ${lastName}`;

			// create unique email from name
			let baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
			let email = `${baseEmail}@example.com`;
			let suffix = 1;
			while (usedEmails.has(email)) {
				suffix += 1;
				email = `${baseEmail}${suffix}@example.com`;
			}
			usedEmails.add(email);

			const phone = `9${randInt(100000000, 999999999)}`.slice(0, 10);

			const experience = randInt(1, 35);
			const specs = sampleMany(SPECIALIZATIONS, 1);
			const quals = sampleMany(QUALIFICATIONS, randInt(1, 3));
			const langs = sampleMany(LANGUAGES, randInt(1, 3));

			// Generate availability in 24-hour HH:mm (15-min increments), ensure to > from
			const fromHour = randInt(7, 12);
			const fromMinute = sample([0, 15, 30, 45]);
			const maxToHour = 22;
			const minToHour = Math.min(fromHour + 1, maxToHour);
			const toHour = randInt(minToHour, maxToHour);
			const toMinute = sample([0, 15, 30, 45]);

			doctors.push({
				name,
				email,
				phone,
				password: hashedPassword,
				specialization: specs[0],
				experience,
				qualifications: quals,
				languages: langs,
				consultationFee: {
					chat: randInt(50, 300),
					voice: randInt(150, 600),
					video: randInt(200, 1000)
				},
				availability: {
					from: formatTime24(fromHour, fromMinute),
					to: formatTime24(toHour, toMinute)
				},
				isOnline: Math.random() < 0.6,
				profileImage: '',
				bio: `Experienced ${specs[0]} with ${experience} years of practice.`,
				rating: parseFloat((3 + Math.random() * 2).toFixed(1)),
				totalReviews: randInt(0, 500),
				isVerified: true // default, will toggle for some below
			});
		}

		// Mark a small percentage as unverified
		const unverifiedCount = Math.max(1, Math.floor(COUNT * UNVERIFIED_PERCENT));
		for (let i = 0; i < unverifiedCount; i++) {
			const idx = Math.floor(Math.random() * doctors.length);
			doctors[idx].isVerified = false;
		}

		// Insert docs (continue on duplicates)
		const result = await Doctor.insertMany(doctors, { ordered: false }).catch(err => {
			// insertMany with ordered:false may still throw if all fail; log and continue
			console.warn('Partial insert error (some docs may already exist):', err.message || err);
		});

		console.log(`Seeder finished. Attempted: ${COUNT}, Unverified marked: ${unverifiedCount}`);
		process.exit(0);
	} catch (err) {
		console.error('Seeder error:', err);
		process.exit(1);
	}
})();
