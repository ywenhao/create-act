import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import minimist from 'minimist'
import { green, red, reset, yellow } from 'kolorist'
import prompts from 'prompts'

// Avoids autoconversion to number of the project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string. See #4606
const argv = minimist<{
  template?: string
  help?: boolean
}>(process.argv.slice(2), {
  default: { help: false },
  alias: { h: 'help', t: 'template' },
  string: ['_'],
})
const cwd = process.cwd()

// prettier-ignore
const helpMessage = `\
使用: create-act [OPTION]... [DIRECTORY]

创建一个初始化项目，使用 TypeScript。
在没有参数的情况下，以交互模式启动CLI。

Options:
  -t, --template NAME

Available template:
${yellow   ('admin-vue-ts'  )}
${green    ('uni-app-ts'    )}`

type ColorFunc = (str: string | number) => string
type Template = {
  name: string
  display: string
  color: ColorFunc
}
const TEMPLATES: Template[] = [
  {
    name: 'admin-vue-ts',
    display: 'admin-vue-ts',
    color: yellow,
  },
  {
    name: 'uni-app-ts',
    display: 'uni-app-ts',
    color: green,
  },
  // {
  //   name: 'react',
  //   display: 'React',
  //   color: cyan,
  // },
]

const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
  '_eslint.config.js': 'eslint.config.js',
}

const defaultTargetDir = 'root-project'

async function init() {
  const argTargetDir = formatTargetDir(argv._[0])
  const argTemplate = argv.template || argv.t

  const help = argv.help
  if (help) {
    console.log(helpMessage)
    return
  }

  let targetDir = argTargetDir || defaultTargetDir
  const getProjectName = () =>
    targetDir === '.' ? path.basename(path.resolve()) : targetDir

  let result: prompts.Answers<
    'projectName' | 'overwrite' | 'packageName' | 'template'
  >

  prompts.override({
    overwrite: argv.overwrite,
  })

  try {
    result = await prompts(
      [
        {
          type: argTargetDir ? null : 'text',
          name: 'projectName',
          message: reset('项目名称:'),
          initial: defaultTargetDir,
          onState: (state) => {
            targetDir = formatTargetDir(state.value) || defaultTargetDir
          },
        },
        {
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'select',
          name: 'overwrite',
          message: () =>
            (targetDir === '.' ? '当前目录' : `目标目录 "${targetDir}"`) +
            ` 不是空的。请选择如何继续:`,
          initial: 0,
          choices: [
            {
              title: '删除现有文件并继续',
              value: 'yes',
            },
            {
              title: '取消操作',
              value: 'no',
            },
            {
              title: '忽略文件并继续',
              value: 'ignore',
            },
          ],
        },
        {
          type: (_, { overwrite }: { overwrite?: string }) => {
            if (overwrite === 'no') {
              throw new Error(red('✖') + ' 操作已取消')
            }
            return null
          },
          name: 'overwriteChecker',
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
          name: 'packageName',
          message: reset('Package name:'),
          initial: () => toValidPackageName(getProjectName()),
          validate: (dir) =>
            isValidPackageName(dir) || 'package.json `name` 无效',
        },
        {
          type:
            argTemplate && TEMPLATES.includes(argTemplate) ? null : 'select',
          name: 'template',
          message:
            typeof argTemplate === 'string' &&
            !TEMPLATES.map((v) => v.name).includes(argTemplate)
              ? reset(`"${argTemplate}" 不是有效的模板。请从下面选择: `)
              : reset('选择模版:'),
          initial: 0,
          choices: TEMPLATES.map((template) => {
            const templateColor = template.color
            return {
              title: templateColor(template.display || template.name),
              value: template,
            }
          }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' 操作已取消')
        },
      },
    )

    console.log(result)
  } catch (cancelled: any) {
    console.log(cancelled.message)
    return
  }

  // user choice associated with prompts
  const { template, overwrite, packageName } = result

  const root = path.join(cwd, targetDir)

  if (overwrite === 'yes') {
    emptyDir(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
  }

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm'

  console.log(`\nScaffolding project in ${root}...`)

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    '../..',
    'template',
    template.name,
  )

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file)
    if (content) {
      fs.writeFileSync(targetPath, content)
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }

  const files = fs.readdirSync(templateDir)
  for (const file of files.filter((f) => f !== 'package.json')) {
    write(file)
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'),
  )

  pkg.name = packageName || getProjectName()

  write('package.json', JSON.stringify(pkg, null, 2) + '\n')

  const cdProjectName = path.relative(cwd, root)
  console.log(`\n完成. 现在输入命令:\n`)
  if (root !== cwd) {
    console.log(
      `  cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName}`,
    )
  }
  switch (pkgManager) {
    case 'yarn':
      console.log('  yarn')
      console.log('  yarn dev')
      break
    default:
      console.log(`  ${pkgManager} install`)
      console.log(`  ${pkgManager} run dev`)
      break
  }
  console.log()
}

function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, '')
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName,
  )
}

function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-')
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path)
  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') {
      continue
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
  }
}

function pkgFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) return undefined
  const pkgSpec = userAgent.split(' ')[0]
  const pkgSpecArr = pkgSpec.split('/')
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  }
}

// function editFile(file: string, callback: (content: string) => string) {
//   const content = fs.readFileSync(file, 'utf-8')
//   fs.writeFileSync(file, callback(content), 'utf-8')
// }

init().catch((e) => {
  console.error(e)
})
