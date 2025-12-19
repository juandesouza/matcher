import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find project root (web/) - use process.cwd() which should be the web/ directory
// In production on Render, process.cwd() is the web/ directory
const projectRoot = process.cwd();
const seedScriptPath = join(projectRoot, 'prisma/seed.js');

console.log('[Admin Seed Once] Project root:', projectRoot);
console.log('[Admin Seed Once] Seed script path:', seedScriptPath);

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		// One-time seed endpoint - no authentication required
		// This should be removed after seeding is complete
		console.log('[Admin Seed Once] Starting database seed (one-time, no auth)...');
		console.log('[Admin Seed Once] Working directory:', projectRoot);
		
		// Generate Prisma client first, then run seed
		console.log('[Admin Seed Once] Generating Prisma client...');
		await execAsync(`npx prisma generate`, {
			cwd: projectRoot,
			env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
			timeout: 60000 // 60 second timeout
		});
		
		console.log('[Admin Seed Once] Running seed script...');
		// Use npx prisma db seed which handles paths automatically
		// Increase timeout for seed operation (creating 60 users can take time)
		const { stdout, stderr } = await execAsync(`npx prisma db seed`, {
			cwd: projectRoot,
			env: {
				...process.env,
				// Ensure DATABASE_URL is set from environment
				DATABASE_URL: process.env.DATABASE_URL
			},
			timeout: 300000 // 5 minute timeout for seed operation
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

