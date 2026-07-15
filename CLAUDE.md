# CLAUDE.md — 真实比例太阳系

## 项目概述

交互式三维太阳系模拟网站，按真实天文数据展示太阳与八大行星。基于 React + Three.js (R3F) + Zustand。

## 常用命令

```bash
npm run dev          # 启动开发服务器 (默认 localhost:5173)
npm run build        # TypeScript 检查 + Vite 生产构建
npx vitest run       # 运行全部单元测试
npx tsc --noEmit     # 仅类型检查
```

## 架构要点

### 坐标系统

- **内部数据**：千米 (km)
- **世界坐标**：`km / 1,000,000`（DISTANCE_SCALE_KM_PER_UNIT）
- **Three.js 映射**：Ecliptic (X, Y, Z) → Three.js (X, Z, Y)，即黄道 Y↔Z 互换
- **浮动原点**：TrackedBody 组件每帧将焦点天体设为局部原点

### 时间系统

- `simulationTimeUtcMs`：UTC 毫秒时间戳，天体位置从此值直接计算
- **禁止帧累加**：所有位置 = f(simulationTimeUtc)，不依赖上一帧位置
- 时钟在 `TimeTicker` 组件的 `useFrame` 中驱动

### 比例系统

- `bodySizeMultiplier` 和 `orbitDistanceMultiplier` 相互独立
- 三种预设模式：realistic(1/1)、enhanced(100/1)、educational(500/0.1)
- 非真实模式必须显示常驻提示横幅

### 轨道力学

- 开普勒椭圆轨道，Newton-Raphson 求解开普勒方程
- 三欧拉角旋转：升交点经度(Ω)、轨道倾角(i)、近心点幅角(ω)
- 轨道路径在 OrbitLine 组件中预计算为 256 点折线

### 状态管理

- `simulation-store.ts`：时间、选择、缩放、摄像机（Zustand，无持久化）
- `settings-store.ts`：UI 偏好（Zustand + persist 中间件 → localStorage）
- URL 参数同步：`url-state.ts` 中 parse/update

## 关键文件

| 文件 | 职责 |
|------|------|
| `data/celestial-bodies.ts` | 全部 9 天体 NASA 数据，修改数据在此文件 |
| `simulation/astronomy/kepler.ts` | 轨道力学核心，修改轨道精度在此文件 |
| `simulation/state/simulation-store.ts` | 全局模拟状态，新增状态/动作在此文件 |
| `components/simulation/SolarScene.tsx` | 3D 场景入口，新增渲染元素在此文件 |
| `components/simulation/CelestialBodyMesh.tsx` | 天体渲染，修改外观在此文件 |

## 编码约定

- 天文数据常量用 UPPER_SNAKE_CASE
- 组件用 PascalCase，工具函数用 camelCase
- 中文 UI 文本直接硬编码（当前无 i18n 库）
- 新增天体：在 `celestial-bodies.ts` 添加数据，场景自动渲染
- 角度在数据层用度数存储，计算层转弧度（`degToRad()`）
- 测试文件放在 `src/tests/` 对应子目录

## 已知约束

- MVP 使用固定轨道根数，不计算行星摄动
- 太阳固定在原点，不模拟太阳系质心运动
- Three.js 单精度浮点，远距离需浮动原点
- 仅支持开普勒近似模式，JPL Horizons 星历为后续计划
