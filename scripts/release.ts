import { release } from '@vitejs/release-scripts'
import colors from 'picocolors'
import { logRecentCommits, run, updateTemplateVersions } from './releaseUtils'
import extendCommitHash from './extendCommitHash'

release({
  repo: 'vite',
  packages: ['create-act'],
  toTag: (pkg, version) =>
    pkg === 'vite' ? `v${version}` : `${pkg}@${version}`,
  logChangelog: (pkg) => logRecentCommits(pkg),
  generateChangelog: async (pkgName) => {
    if (pkgName === 'create-act') await updateTemplateVersions()

    console.log(colors.cyan('\nGenerating changelog...'))
    const changelogArgs = [
      'conventional-changelog',
      '-p',
      'angular',
      '-i',
      'CHANGELOG.md',
      '-s',
      '--commit-path',
      '.',
    ]
    await run('npx', changelogArgs, { cwd: `./${pkgName}` })
    // conventional-changelog generates links with short commit hashes, extend them to full hashes
    extendCommitHash(`./${pkgName}/CHANGELOG.md`)
  },
})
