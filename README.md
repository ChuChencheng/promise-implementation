# Promise-implementation

符合 Promises/A+ 规范

微任务用的 `queueMicrotask` ，在 node 环境需要 `v11` 以上才支持，如果有需要可以自行改写其他微任务实现

本项目作为学习手写 Promise 练习用，不要用在生产环境。

## Entry

实现在 `promise.ts` 中，有关于规范的详细注释。

已通过 [`promises-aplus-tests`](https://github.com/promises-aplus/promises-tests) 测试 (2020-01-14)

`catch`, `finally`, `all`, `race`, `allSettled` 暂未测试

## Run test

```bash
yarn test
```
