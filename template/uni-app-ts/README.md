# uniapp-template

## 技术栈

- uniapp + vite + typescript + vue3 + pinia
- jsBridge + stylelint + eslint

## 准备

- 项目使用`pnpm`
- vscode 打开项目，编辑器右下角出现项目推荐插件的弹窗，点击安装即可。

```sh
# 全局安装pnpm
npm i -g pnpm
# 项目根目录安装依赖
pnpm i
```

## 项目提交

```sh
pnpm cm
```

## request

- 目前只写了`post`、`get`、`delete`、`put`其他请求方式如有需要自行扩展。
- `custom`参数类型 `HttpCustom`，参考`src/utils/http/index.ts`

## router/pages

- 路由写法靠近`vue-router`，参考`src/router`目录
- 应用在`pages.config.ts`文件，`src/pages.json`文件是通过插件自动生成，不要手动修改。`ts`文件更灵活。

## manifest

- 配置文件`manifest.json`，参考`manifest.config.ts`
- 大部分配置项,提取到`.env`文件，方便配置。

## env

- `.env`，主配置文件，其他`.env.xxx`文件和主文件合并。
- `.env`配置的内容默认没有类型提示，需要在`env.d.ts`手动配置`interface ImportMetaEnv`, 以获得`import.meta.env`的类型提示。

## layouts

- 布局组件，`src/layouts`目录。
- 默认使用`src/layouts/default.vue`。

## jsBridge

- 项目里面配置 `androidBridge`和`iOSBridge`，export导出内容的类型需要一致。
- 壳子里面配置 `androidBridge`和`iOSBridge`，需要约定两个端的参数和返回值相同。
- 使用的时候，直接调用`jsBridge.xxx` `jsBridge.onReady`，因为其通信参数和返回值一致，所以可以直接使用。

## 自定义vite插件

- `build`目录下

### deleteStatic

  - 删除`dist`目录下的静态文件

### obsStatic
  - 替换项目中`static`路径为 `VITE_OBS_URL`，可根据项目要求自行更改
  - 需要在`.env`和`.env.d.ts`配置 `VITE_OBS_URL`环境变量
