import { release } from '@vitejs/release-scripts'
import colors from 'picocolors'
import { logRecentCommits, run, updateTemplateVersions } from './releaseUtils'
import extendCommitHash from './extendCommitHash'

release({
  repo: 'create-act',
  packages: ['create-act'],
  toTag: (pkg, version) => `v${version}`,
  logChangelog: (pkg) => logRecentCommits(pkg),
  generateChangelog: async () => {
    await updateTemplateVersions()

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
    await run('npx', changelogArgs, { cwd: `.` })
    // conventional-changelog generates links with short commit hashes, extend them to full hashes
    extendCommitHash(`./CHANGELOG.md`)
  },
})
