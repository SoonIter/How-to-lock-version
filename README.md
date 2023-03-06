# how to lock version ?

锁依赖：某一依赖使用某一确定的版本，分为 "子workspace的直接依赖" 和 "第三方包的直接依赖"

## 子workspace 的直接依赖

直接依赖直接通过 package.json 声明，确定某一版本，无需使用 pnpm 的 hack 功能

如 某个子 workspace 确定 react 的版本为

```json5
{
  "name": "a",
  "dependencies": {
    "react": "18.2.0"
  }
}
```

每个独立的包都有 `确定直接依赖` 的能力，直接依赖再确定直接依赖的直接依赖，以此递归来组成整个 `node_modules` 的版本

## 第三方包的直接依赖 (overrides and .pnpmfile.cjs)

这里第三方包的直接依赖，相对于 子workspace 来说就是间接依赖

理解了 `覆写 package.json 来确定直接依赖的版本` ，也可以更改第三方包的直接依赖

以 overrides 为例，pnpm 提供了以 `"a>b":"版本号"` 的方式来覆写 `package.json`

```json5
{
  "pnpm": {
    "overrides": {
      "react@18.2.0>loose-envify": "1.0.0",
      "react>loose-envify": "1.0.0",
      "loose-envify": "1.0.0"
    }
  }
}
```


**1. `"react@18.2.0>loose-envify": "1.0.0"`**


在 `"react@18.2.0"` 的 `package.json`，改写 `loose-envify` 的版本为 `1.0.0`，无论 "dependencies" 还是 "devDependencies"

**2. `"react>loose-envify": "1.0.0"`**

等价为 `react@*>loose-envify`

在 `"react@**"`(所有react版本，react@16 react@17 react@18等) 的 `package.json` 覆写 `loose-envify` 的版本为 1.0.0，无论 "dependencies" 还是 "devDependencies"，还是 react@16 react@17 react@18

**3. `"loose-envify": "1.0.0"`**

等价为 `*>loose-envify`

在 所有包的 `package.json` 覆写`loose-envify` 的版本为 1.0.0，包括所有的子 workspace
(常用于整个 monorepo 某个包确定唯一版本)

**但需要注意的是不存在 `a>b>c` 这种形式**

由于每个包只能确定自己的直接依赖，一个包的一个具体版本在 lockfile 中独一份，所以不存在锁间接依赖，和基于某个子 workspace 维度锁依赖 

（否则就会造成多分身的问题，不过 pnpm 中 peer 存在多分身，利用此 Hack 来确定间接依赖版本，可见我这个仓库 [SoonIter/pnpm-peer-trick](https://github.com/SoonIter/pnpm-peer-trick)）

```json5
// package.json
"overrides": {
  "react>loose-envify>js-tokens": "8.0.0", // ❌
  
  "react>loose-envify": "1.1.0",           // ✅
  "loose-envify@1.1.0>js-tokens": "8.0.0",
}
```

.pnpmfile.cjs 同理, 不过它比 overrides 更加灵活


> hooks.readPackage(pkg, context): pkg | Promise\<pkg\>
> Allows you to mutate a dependency's package.json after parsing and prior to resolution. 

```js
function readPackage(pkg, context) {
  if (pkg.name === 'react') {
    pkg.dependencies["loose-envify"] = "1.0.0";
  } 
  return pkg;
}
module.exports = {
  hooks: {
    readPackage,
  },
};
```
