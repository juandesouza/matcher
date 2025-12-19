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
		
		// Run migrations first to ensure tables exist
		console.log('[Admin Seed Once] Running database migrations...');
		console.log('[Admin Seed Once] DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');
		let migrationOutput = '';
		try {
			const migrationResult = await execAsync(`npx prisma migrate deploy 2>&1`, {
				cwd: projectRoot,
				env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
				timeout: 120000 // 2 minute timeout for migrations
			});
			migrationOutput = migrationResult.stdout || '';
			console.log('[Admin Seed Once] Migration stdout:', migrationOutput);
			if (migrationResult.stderr) {
				migrationOutput += '\n' + migrationResult.stderr;
				console.log('[Admin Seed Once] Migration stderr:', migrationResult.stderr);
			}
			console.log('[Admin Seed Once] Migrations completed.');
		} catch (error) {
			migrationOutput = `Migration error: ${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`;
			console.error('[Admin Seed Once] Migration failed:', error);
			// Continue anyway - might be that migrations are already applied
		}
		
		// Run the seed script
		console.log('[Admin Seed Once] Running seed script...');
		const seedScriptPath = join(projectRoot, 'prisma/seed.js');
		const { stdout, stderr } = await execAsync(`node ${seedScriptPath}`, {
			cwd: projectRoot,
			env: {
				...process.env,
				// Ensure DATABASE_URL is set from environment
				DATABASE_URL: process.env.DATABASE_URL
			},
			timeout: 60000 // 1 minute timeout (only 4 users now)
		});

		console.log('[Admin Seed Once] Seed output:', stdout);
		if (stderr) {
			console.error('[Admin Seed Once] Seed errors:', stderr);
		}

		return json({ 
			success: true, 
			message: 'Seed script executed successfully',
			migrationOutput: migrationOutput,
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

