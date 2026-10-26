const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const { execSync } = require('child_process');

async function syncGit() {
  const dir = '.';
  const token = execSync('"C:\\Program Files\\GitHub CLI\\gh.exe" auth token', { encoding: 'utf8' }).trim();
  const matrix = await git.statusMatrix({ fs, dir });
  for (const [filepath, head, workdir] of matrix) {
    if (workdir === 1 || workdir === 2) {
      await git.add({ fs, dir, filepath });
    }
  }
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Ankit',
      email: 'ankittt98@users.noreply.github.com',
      timestamp: Math.floor(Date.now() / 1000),
      timezoneOffset: -330
    },
    committer: {
      name: 'Ankit',
      email: 'ankittt98@users.noreply.github.com',
      timestamp: Math.floor(Date.now() / 1000),
      timezoneOffset: -330
    },
    message: 'fix: instant dark mode theme engine & auto-closing notifications dropdown on outside click'
  });
  console.log('Committed commit:', sha);
  const pushRes = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    force: true,
    onAuth: () => ({ username: token })
  });
  console.log('Pushed to GitHub:', pushRes.ok);
  fs.unlinkSync('sync.cjs');
}
syncGit().catch(console.error);
