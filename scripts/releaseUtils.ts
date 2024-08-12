import { readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import colors from 'picocolors'
import type { Options as ExecaOptions, ResultPromise } from 'execa'
import { execa } from 'execa'
import fs from 'fs-extra'

export function run<EO extends ExecaOptions>(
  bin: string,
  args: string[],
  opts?: EO,
): ResultPromise<EO & (keyof EO extends 'stdio' ? {} : { stdio: 'inherit' })> {
  return execa(bin, args, { stdio: 'inherit', ...opts }) as any
}

export async function getLatestTag(): Promise<string> {
  const pkgJson = await fs.readJson(`./package.json`)
  const version = pkgJson.version
  return `v${version}`
}

export async function logRecentCommits(pkgName: string): Promise<void> {
  const tag = await getLatestTag()
  if (!tag) return
  const sha = await run('git', ['rev-list', '-n', '1', tag], {
    stdio: 'pipe',
  }).then((res) => res.stdout.trim())
  console.log(
    colors.bold(
      `\n${colors.blue(`i`)} Commits of ${colors.green(
        pkgName,
      )} since ${colors.green(tag)} ${colors.gray(`(${sha.slice(0, 5)})`)}`,
    ),
  )
  await run(
    'git',
    ['--no-pager', 'log', `${sha}..HEAD`, '--oneline', '--', `.`],
    { stdio: 'inherit' },
  )
  console.log()
}

export async function updateTemplateVersions(): Promise<void> {
  const version = fs.readJSONSync('package.json').version
  if (/beta|alpha|rc/.test(version)) return

  const dir = './template'
  const templates = readdirSync(dir)

  for (const template of templates) {
    const pkgPath = path.join(dir, template, `package.json`)
    const pkg = fs.readJSONSync(pkgPath)
    pkg.version = version
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }
}
