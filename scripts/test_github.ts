/*
 Simple TS test runner for Convex GitHub integration.
 - Calls Convex actions: github:getStatus and github:selfTest using the convex CLI.
 - Requires convex CLI installed and project linked (convex dev or deployed).
 Run: bun run test:github
*/
import { execFileSync } from 'node:child_process';

function runConvex(command: string, args: string[] = []): any {
  try {
    const out = execFileSync('convex', ['run', command, ...args], { encoding: 'utf8' });
    return JSON.parse(out);
  } catch (e: any) {
    const msg = e.stdout?.toString?.() || e.message;
    throw new Error(`convex run ${command} failed: ${msg}`);
  }
}

function assert(cond: any, msg: string) {
  if (!cond) {
    console.error(`[FAIL] ${msg}`);
    process.exit(1);
  }
}

try {
  console.log('[INFO] Checking Convex GitHub status...');
  const status = runConvex('github:getStatus');
  console.log('[DEBUG] status =', status);
  assert(typeof status?.username === 'string' && status.username.length > 0, 'GITHUB_USERNAME missing in Convex env');
  assert(typeof status?.hasToken === 'boolean', 'hasToken missing from status');

  console.log('[INFO] Running selfTest...');
  const self = runConvex('github:selfTest');
  console.log('[DEBUG] selfTest =', self);

  assert(self.username === status.username, 'selfTest username mismatch');
  if (status.hasToken) {
    assert(self.contributions?.ok === true, 'Expected contributions to be ok with token');
  }
  assert(self.profile?.ok === true, 'Profile fetch failed');
  assert(self.pinned?.ok === true, 'Pinned/repos fetch failed');

  console.log('[SUCCESS] Convex GitHub OK');
  console.log(`Username=${self.username}, hasToken=${status.hasToken}, pinnedCount=${self.pinned?.count}, contribCount=${self.contributions?.count ?? 0}`);
  process.exit(0);
} catch (e: any) {
  console.error('[ERROR]', e.message || e);
  console.error('Hint: Ensure Convex CLI is installed (npm i -g convex), you are logged in, project is linked, and env vars set in Convex dashboard:');
  console.error('- GITHUB_USERNAME = your GitHub login');
  console.error('- GITHUB_TOKEN = a PAT with repo:read and read:user');
  process.exit(1);
}
