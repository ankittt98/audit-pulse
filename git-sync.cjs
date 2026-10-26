const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  const dir = path.resolve(__dirname);
  console.log('Project dir:', dir);

  // Get token from gh cli
  const token = execSync('"C:\\Program Files\\GitHub CLI\\gh.exe" auth token', { encoding: 'utf8' }).trim();
  console.log('GH Token acquired successfully (starts with:', token.substring(0, 7) + '...)');

  // Remove existing .git to ensure 100% clean history without any legacy references
  const gitDir = path.join(dir, '.git');
  if (fs.existsSync(gitDir)) {
    console.log('Removing old .git directory...');
    fs.rmSync(gitDir, { recursive: true, force: true });
  }

  // Initialize fresh git repository
  console.log('Initializing fresh Git repository...');
  await git.init({ fs, dir, defaultBranch: 'main' });

  // Add remote origin
  console.log('Adding remote origin...');
  await git.addRemote({
    fs,
    dir,
    remote: 'origin',
    url: 'https://github.com/ankittt98/audit-pulse.git',
  });

  // Get all files respecting .gitignore
  console.log('Reading status matrix and staging files...');
  const matrix = await git.statusMatrix({ fs, dir });
  for (const [filepath, head, workdir] of matrix) {
    if (workdir === 1 || workdir === 2) {
      await git.add({ fs, dir, filepath });
    }
  }

  // Commit with author Ankit
  console.log('Committing changes as Ankit...');
  const commitSha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Ankit',
      email: 'ankittt98@users.noreply.github.com',
      timestamp: Math.floor(Date.now() / 1000),
      timezoneOffset: -330,
    },
    committer: {
      name: 'Ankit',
      email: 'ankittt98@users.noreply.github.com',
      timestamp: Math.floor(Date.now() / 1000),
      timezoneOffset: -330,
    },
    message: 'feat: AuditPulse Enterprise Admin Portal by Ankit, Multi-User Login & Indian Personas',
  });
  console.log('Committed SHA:', commitSha);

  // Push to GitHub main branch with force
  console.log('Pushing to GitHub (ankittt98/audit-pulse main)...');
  const pushResult = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    force: true,
    onAuth: () => ({ username: token }),
  });
  console.log('Push result:', pushResult);

  // Remove helper script
  fs.unlinkSync(path.join(dir, 'git-sync.cjs'));
  console.log('Sync complete!');
}

main().catch((err) => {
  console.error('Error in git-sync:', err);
  process.exit(1);
});
