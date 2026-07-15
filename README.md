# 真实比例太阳系 (True Scale Solar System)

一个基于 Web 的交互式三维太阳系模拟，按照真实天文数据展示太阳与八大行星的相对尺寸、距离、公转与自转。

## 功能特性

### 天体模拟

- **太阳 + 八大行星**，数据来自 NASA/JPL
- **椭圆轨道**：基于开普勒方程 Newton-Raphson 求解，体现离心率与轨道倾角
- **公转运动**：从统一模拟时间戳直接计算，非帧累加，暂停/变速不影响精度
- **自转动画**：支持顺行与逆行（金星、天王星），轴倾角可视化
- **真实比例**：天体尺寸与轨道距离使用同一换算比例

### 比例系统

| 模式 | 天体尺寸 | 轨道距离 | 说明 |
|------|---------|---------|------|
| 真实比例 | 1× | 1× | 严格真实，行星可能仅像素大小 |
| 增强可见 | 可调（默认 100×） | 1× | 轨道距离真实，球体放大以便观察 |
| 教学演示 | 500× | 0.1× | 尺寸与距离均压缩，多行星同屏 |

天体尺寸倍率与轨道距离倍率**相互独立**，可分别调节。

### 时间控制

- 播放 / 暂停
- 7 档时间倍率：实时、1 分/秒、1 小时/秒、1 天/秒、10 天/秒、30 天/秒、1 年/秒
- 正向 / 反向时间
- 单步前进/后退 1 天
- 日期时间输入跳转
- 一键回到当前时间
- UTC / 本地时间切换

### 三维场景

- React Three Fiber (WebGL 2)
- 太阳点光源 + 环境光（科学/辅助两种模式）
- 椭圆轨道线（可开关，选中高亮）
- 星空背景
- 赤道环 + 自转轴可视化
- 浮动原点精度处理

### 摄像机

| 模式 | 说明 |
|------|------|
| 自由 | OrbitControls 拖拽旋转、滚轮缩放 |
| 跟随 | 锁定选中天体，跟随公转 |
| 俯视 | 从黄道面北极方向俯瞰 |
| 近看 | 靠近天体表面观察自转与相对大小 |

### 界面

- **左侧导航面板**：天体列表，点击聚焦
- **右侧信息面板**：选中天体详细参数（半径、质量、公转周期、当前距太阳距离、光行时间等）
- **顶部状态栏**：比例模式切换、摄像机模式、尺寸/距离倍率、轨道模型信息
- **底部时间轴**：播放控制、时间显示、倍率选择
- 增强/教学模式常驻提示横幅
- 全中文界面
- URL 查询参数状态分享

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 8 |
| 3D 渲染 | Three.js + @react-three/fiber + @react-three/drei |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS 4 |
| 图标 | Lucide React |
| 测试 | Vitest |
| 包管理 | npm |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 运行测试
npx vitest run

# 预览生产构建
npm run preview
```

## 项目结构

```
src/
├── App.tsx                          # 主应用组件
├── main.tsx                         # 入口文件
├── index.css                        # 全局样式 + Tailwind
│
├── data/
│   ├── celestial-bodies.ts          # 9 天体 NASA/JPL 真实数据
│   └── sources.ts                   # 数据来源引用
│
├── simulation/
│   ├── astronomy/
│   │   ├── kepler.ts                # 开普勒方程求解 (Newton-Raphson)
│   │   ├── orbital-elements.ts      # 轨道位置计算 + 轨道路径生成
│   │   ├── rotation.ts              # 自转角计算
│   │   └── time.ts                  # 模拟时间管理
│   ├── rendering/
│   └── state/
│       ├── simulation-store.ts      # 主状态 (时间/选择/缩放/摄像机)
│       └── settings-store.ts        # 用户偏好 (持久化)
│
├── components/
│   ├── simulation/
│   │   ├── SolarScene.tsx           # R3F Canvas + 逐帧位置更新
│   │   ├── CelestialBodyMesh.tsx    # 球体网格 + 赤道环
│   │   ├── OrbitLine.tsx            # 椭圆轨道线
│   │   ├── CameraController.tsx     # 4 种摄像机模式
│   │   ├── BodyLabel.tsx            # HTML 天体标签
│   │   ├── Lighting.tsx             # 光照系统
│   │   └── StarBackground.tsx       # 星空背景
│   ├── controls/
│   │   ├── ScaleControls.tsx        # 比例/摄像机/显示控制
│   │   └── TimeControls.tsx         # 时间播放控制
│   └── panels/
│       ├── NavigationPanel.tsx      # 天体导航列表
│       └── InfoPanel.tsx            # 天体信息面板
│
├── utils/
│   ├── units.ts                     # km ↔ 世界坐标转换
│   ├── formatting.ts                # 数字/距离/时间格式化
│   └── url-state.ts                 # URL 参数同步
│
└── tests/
    └── astronomy/
        └── kepler.test.ts           # 32 个单元测试
```

## 核心设计

### 时间系统

模拟时间基于统一的 UTC 毫秒时间戳，天体位置从该时间戳**直接求值**，而非逐帧累加：

```
simulationTimeUtc += realDeltaSeconds * timeScale * timeDirection
position = computeOrbitalPosition(orbit, simulationTimeUtc)
```

无论暂停、变速、切标签页或掉帧，结果一致。

### 比例系统

内部统一使用千米 (km)，渲染前转换为世界坐标：

```
世界坐标 = 物理千米 / DISTANCE_SCALE_KM_PER_UNIT
渲染半径 = 世界坐标 × bodySizeMultiplier
渲染位置 = 世界坐标 × orbitDistanceMultiplier
```

`1 世界单位 = 1,000,000 km`，两个倍率相互独立。

### 轨道力学

采用开普勒椭圆轨道模型：

1. 平近点角 M = M₀ + n × Δt
2. 开普勒方程 M = E − e × sin(E)（Newton-Raphson 迭代）
3. 轨道平面坐标 → 三维空间旋转（Ω, i, ω 三欧拉角）

### 浮动原点

每帧将当前焦点天体设为局部原点，传入 GPU 的坐标为相对坐标，避免远距离浮点精度丢失。

## 数据来源

- [NASA/JPL Solar System Dynamics](https://ssd.jpl.nasa.gov/) — 行星轨道参数与物理特征
- [NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/) — 行星基础物理参数
- [NASA Solar System Exploration](https://solarsystem.nasa.gov/) — 行星比较数据

## 键盘快捷键

| 按键 | 功能 |
|------|------|
| `Space` | 播放 / 暂停 |
| `R` | 回到当前时间 |
| `→` | 前进 1 天 |
| `←` | 后退 1 天 |
| `Esc` | 取消选中 |

## URL 参数

支持通过 URL 查询参数分享特定视图状态：

```
/?body=earth&date=2026-07-15T12:00:00Z&timeScale=86400&bodyScale=100&distanceScale=1&camera=follow
```

| 参数 | 说明 | 示例 |
|------|------|------|
| `body` | 聚焦天体 ID | `earth` |
| `date` | 模拟时间 (ISO 8601) | `2026-07-15T12:00:00Z` |
| `timeScale` | 时间倍率 (模拟秒/现实秒) | `86400` |
| `bodyScale` | 天体尺寸倍率 | `100` |
| `distanceScale` | 轨道距离倍率 | `1` |
| `camera` | 摄像机模式 | `free` / `follow` / `topdown` / `surface` |

## 测试

```bash
npx vitest run
```

覆盖范围：
- 开普勒方程求解精度（圆轨道、高离心率、归一化）
- 轨道位置计算（地球 ~1 AU、行星距离排序）
- 轨道路径闭合性与离心率差异
- 自转方向（顺行/逆行）
- 单位换算往返精度
- 天体数据完整性与物理一致性

## 后续计划

- JPL Horizons 高精度星历接入
- 月球与主要卫星
- 土星环、天王星环
- 小行星带 / 柯伊伯带
- 光行时间模式
- 现实缩尺模型计算器
- 距离旅行模式
- 天体尺寸对比页面
- 日食、凌日、合相等天象
- PWA 离线能力
