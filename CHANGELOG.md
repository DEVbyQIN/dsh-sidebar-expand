# Changelog

## 0.1.0 — 2026-11-03

首个版本：把四个侧边栏插件打成一个 bundle。

- 组合 `dsh-sidebar-marks@0.1.1` + `dsh-active-sessions@0.1.1` + `dsh-sidebar-shortcuts@0.1.0` + `dsh-back-to-chat@0.1.1`，安装一次全部就位。
- 每个组件在「插件」页的组合包详情里各有一个启用/停用开关，外带组件自己的配置页入口。
- bundle 层不含插件代码，只插入四行 Loader entry；组件包保留单独安装能力。
