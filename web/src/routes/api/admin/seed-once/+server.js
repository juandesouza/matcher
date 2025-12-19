import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find project root (web/) - go up from web/src/routes/api/admin/seed-once/+server.js
let projectRoot = process.cwd();
if (__dirname.includes('src/routes')) {
	// Development mode
	projectRoot = join(__dirname, '../../../../../../');
} else if (__dirname.includes('build')) {
	// Production build
	projectRoot = join(__dirname, '../../../..');
}

const seedScriptPath = join(projectRoot, 'prisma/seed.js');

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		// One-time seed endpoint - no authentication required
		// This should be removed after seeding is complete
		console.log('[Admin Seed Once] Starting database seed (one-time, no auth)...');
		
		// Run the seed script
		const { stdout, stderr } = await execAsync(`node ${seedScriptPath}`, {
			cwd: projectRoot,
			env: {
				...process.env,
				// Ensure DATABASE_URL is set from environment
				DATABASE_URL: process.env.DATABASE_URL
			}
		});

		console.log('[Admin Seed Once] Seed output:', stdout);
		if (stderr) {
			console.error('[Admin Seed Once] Seed errors:', stderr);
		}

		return json({ 
			success: true, 
			message: 'Seed script executed successfully',
			output: stdout,
			errors: stderr || null
		});

	} catch (error) {
		console.error('[Admin Seed Once] Error:', error);
		return json({ 
			error: 'Seed script failed', 
			message: error.message,
			output: error.stdout || null,
			errors: error.stderr || null
		}, { status: 500 });
	}
}

