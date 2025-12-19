#!/usr/bin/env node

/**
 * Script to seed Render database using Render API
 * This script calls an admin API endpoint on your Render service to run the seed script
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env') });

const RENDER_API_KEY = process.env.RENDER_API_KEY;
const RENDER_SERVICE_URL = process.env.RENDER_SERVICE_URL || 'https://matcher-m0o4.onrender.com';
const SEED_SECRET = process.env.SEED_SECRET || 'temporary-seed-secret-change-in-production';

if (!RENDER_API_KEY) {
	console.error('❌ Error: RENDER_API_KEY not found');
	console.error('   Please add RENDER_API_KEY=rnd_... to web/.env');
	console.error('   Or set it as an environment variable: export RENDER_API_KEY=rnd_...');
	process.exit(1);
}

async function getServiceInfo() {
	console.log('📡 Fetching service information from Render API...');
	
	const response = await fetch('https://api.render.com/v1/services', {
		headers: {
			'Authorization': `Bearer ${RENDER_API_KEY}`,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`API request failed: ${response.status} ${response.statusText}\n${error}`);
	}

	const services = await response.json();
	return services;
}

async function findService(services, serviceName) {
	for (const service of services) {
		const name = service.service?.name || service.name || '';
		if (name === serviceName || name.includes(serviceName)) {
			return service;
		}
	}
	return null;
}

async function triggerSeed() {
	console.log('🌱 Triggering database seed on Render service...');
	console.log(`   Service URL: ${RENDER_SERVICE_URL}\n`);

	const seedEndpoint = `${RENDER_SERVICE_URL}/api/admin/seed`;
	
	console.log('📡 Calling seed endpoint...');
	
	const response = await fetch(seedEndpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			secret: SEED_SECRET
		})
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Seed request failed: ${response.status} ${response.statusText}\n${error}`);
	}

	const result = await response.json();
	return result;
}

async function main() {
	console.log('🌱 Render Database Seeding via API');
	console.log('===================================\n');

	try {
		// Get service info to verify it exists
		const services = await getServiceInfo();
		const service = findService(services, 'matcher-web');
		
		if (service) {
			const serviceName = service.service?.name || service.name || 'Unknown';
			console.log(`✅ Found service: ${serviceName}\n`);
		} else {
			console.log('⚠️  Service not found in API, but continuing with direct endpoint call...\n');
		}

		// Trigger the seed via the admin endpoint
		const result = await triggerSeed();

		if (result.success) {
			console.log('✅ Seed script executed successfully!\n');
			if (result.output) {
				console.log('📋 Output:');
				console.log(result.output);
			}
			if (result.errors) {
				console.log('\n⚠️  Warnings/Errors:');
				console.log(result.errors);
			}
			console.log('\n✅ Database seeded successfully!');
		} else {
			console.error('❌ Seed script failed:', result.message || 'Unknown error');
			if (result.errors) {
				console.error('\nErrors:', result.errors);
			}
			process.exit(1);
		}

	} catch (error) {
		console.error('❌ Error:', error.message);
		if (error.stack) {
			console.error(error.stack);
		}
		process.exit(1);
	}
}

main();
