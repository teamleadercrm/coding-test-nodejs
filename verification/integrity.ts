// Checks that the three protected paths are exactly as you received them.
//
// The baseline is this repo's own root commit — however you obtained the repo,
// its first commit is the one we handed over. There is no pinned SHA to go
// stale, and pushing your own commits does not move the baseline.
//
// A speed bump, not a control: anything in a repo can be edited, this file
// included. It is here so that an accident is caught before you submit rather
// than after.

import { execFileSync } from 'node:child_process';

const PROTECTED = ['fixtures', 'verification', '.github/workflows'];

const git = (...args: string[]): string =>
  execFileSync('git', args, { encoding: 'utf8' }).trim();

let root: string;
try {
  root = git('rev-list', '--max-parents=0', 'HEAD').split('\n').pop() ?? '';
} catch {
  console.error('Not a git repository, so there is no baseline to compare against.');
  process.exit(1);
}

// A shallow clone (`git clone --depth 1`) has no root commit to find: git
// reports the boundary instead, which is HEAD, and the comparison would pass
// without having checked anything. Say so rather than print a false pass.
if (git('rev-parse', '--is-shallow-repository') === 'true' && root === git('rev-parse', 'HEAD')) {
  console.error('This is a shallow clone, so the baseline commit is not present.');
  console.error('Run `git fetch --unshallow`, then try again.');
  process.exit(1);
}

const diff = execFileSync('git', ['diff', root, '--', ...PROTECTED], { encoding: 'utf8' });

if (diff.trim() === '') {
  console.log(`Untouched: ${PROTECTED.join(', ')} — baseline ${root.slice(0, 7)}`);
  process.exit(0);
}

console.error(`Changed since baseline ${root.slice(0, 7)}:\n`);
console.error(git('diff', '--stat', root, '--', ...PROTECTED));
console.error('\nThese three paths are the floor. Revert them before you submit.\n');
console.error(diff);
process.exit(1);
