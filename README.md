# Promise-implementation

符合 Promises/A+ 规范

微任务用的 `queueMicrotask` ，在 node 环境需要 `v11` 以上才支持，如果有需要可以自行改写其他微任务实现

本项目作为学习手写 Promise 练习用，不要用在生产环境。

## 入口文件

实现在 `promise.ts` 中，有关于规范的详细注释。

已通过 [`promises-aplus-tests`](https://github.com/promises-aplus/promises-tests) 测试 (2020-01-14)

`catch`, `finally`, `all`, `race`, `allSettled` 测试用例是自己写的，可能有不足，欢迎补充。

## 测试

使用以下命令来测试是否符合 Promises/A+ 规范、其他方法是否测试通过

```bash
yarn test
```

## 编译

执行 `yarn compile` 将 TypeScript 编译成 JavaScript

## 测试是否符合规范

如果只要测试是否符合 Promises/A+ 规范，运行 `yarn test-aplus`

## 测试其他方法

要运行 `catch`, `finally`, `all`, `race`, `allSettled` 这几个方法的测试用例，运行 `yarn test-methods`
