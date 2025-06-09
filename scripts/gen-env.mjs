import { execSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const gitTag = execSync('git describe --tags')
    .toString().trim().split('-').slice(0, 2).join('-');

const lastCommit = execSync('git log -1 --format=%cd')
    .toString().trim();

// run whatever came after “npm run dev …”
const argsFromNpm = process.argv.slice(2);        // e.g. ["--host"]

spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['vite', ...argsFromNpm],
    {
        stdio: 'inherit',
        env: {
            ...process.env,
            VITE_APP_GIT_TAG: gitTag,
            VITE_APP_LAST_COMMIT: lastCommit
        }
    }
).on('exit', code => process.exit(code));