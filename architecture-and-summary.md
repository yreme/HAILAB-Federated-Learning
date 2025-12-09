# 港口联邦学习演示前端：架构与工作总结

## 1. 代码架构与模块功能

### 1.1 技术栈
- **前端框架**：React 18 + TypeScript + Vite
- **样式系统**：Tailwind CSS + 自定义动画（如联邦链路流动）
- **可视化库**：react-chartjs-2 / Chart.js（训练曲线、指标卡）、SVG 自绘（联邦拓扑）
- **数据层**：静态 JSON mock 数据 + `modelService` 封装（后续可替换为 REST/WebSocket/Flower/FedML SDK）

### 1.2 主要模块
| 模块 | 路径 | 功能 |
| --- | --- | --- |
| 顶部导航 `TopNav` | `src/components/layout/TopNav.tsx` | 展示系统标题、通知列表、联邦拓扑入口；支撑悬浮/点击保持的弹层交互 |
| 模型总览 `ModelGrid` | `src/components/models/ModelGrid.tsx` | 首页豆腐块，涵盖模型缩略图、版本对比、节点分布及联邦增益 |
| 模型详情 `ModelDetailView` | `src/components/models/ModelDetailView.tsx` | 四大页签：概览/训练表现/联邦任务/推理体验；可切换本地/联邦版本、选择历史联邦任务查看指标 |
| 指标/图表组件 | `src/components/dashboard`、`src/components/charts` | 指标卡（mAP/Precision/Recall）、Dataset 概览、Loss/Map 曲线可复用在不同任务上 |
| 联邦任务卡片 | 同上 | 运行中任务日志、排队任务（优先级/预计等待）、历史完成任务（指标增益、评测入口） |
| 推理体验 | `ModelDetailView` 内 | 上传占位、样本列表、各版本切换、检测指标面板 |
| 联邦拓扑 `FederatedTopologyMap` | `src/components/topology` | 基于中国地图轮廓绘制中心节点（博大厦门、厦大）与分节点（上海/宁波/青岛/天津/深圳），通过动态虚线呈现参数同步状态 |

### 1.3 数据与接口设计
- **模型数据 (`src/data/models/*.json`)**
  - `summary`：本地/联邦版本、节点、健康状态
  - `performance`：默认指标、损失/曲线（可被单次任务覆盖）
  - `versions`：本地/联邦历史版本列表
  - `tasks`：`running/queued/completed`，其中 `completed` 可附加 `results`（指标对比、曲线数据）
  - `inference`：样本占位图、默认模型版本
- **联邦拓扑 (`src/data/networkTopology.ts`)**
  - `topologyNodes`：节点类型（`central`/`branch`）、经纬近似坐标
  - `topologyEdges`：链路状态（`sync`/`pending`/`idle`）
- **服务层 (`src/services/modelService.ts`)**
  - `listModels()`：返回模型摘要（供首页渲染）
  - `getModelDetail(id)`：返回完整模型详情；未来可在此替换为 REST/gRPC/WebSocket 请求，并保持前端 API 不变

### 1.4 接口替换建议
| 场景 | 当前 mock | 真实化建议 |
| --- | --- | --- |
| 模型列表/详情 | 读取 JSON | 对接模型版本管理服务（REST `/models`, `/models/{id}`），字段沿用现有结构 |
| 联邦任务状态 | JSON 内 `tasks` | Flower/FedML 等调度接口（WebSocket 推送 + 历史查询 API） |
| 推理体验 | 静态样本 | 对接推理服务（文件上传 + 结果回调），可直接复用 `selectedSample` 面板 |
| 拓扑数据 | `networkTopology.ts` | 来自监控系统或 Prometheus/GraphQL，返回节点坐标、链路状态即可 |

## 2. 已完成工作汇总
1. **完成 React+TS+Tailwind 项目搭建**，并迁移原 HTML UI 至组件化结构，保证 `npm run build`、`npm run dev` 可直接运行。
2. **构建多模型首页看板**，包含 7 个港口垂类场景的豆腐块，展示本地/联邦版本差异及节点覆盖。
3. **编写 detail 级交互**：
   - 模型概览、指标卡、版本时间线
   - 训练表现页签支持选择历史联邦任务，动态切换指标与曲线
   - 联邦任务页签提供运行日志、排队状态、历史完成任务（含指标增益）及新任务表单
   - 推理体验可切换模型版本与样本，并预留上传入口
4. **联邦拓扑可视化**：独立弹层展示博大(厦门)总部 + 厦门大学双中心与上海/宁波/青岛/天津/深圳等分节点，关联链路状态动效，突出同步/排队/待命等信息。
5. **顶部通知中心**：支持多条任务完成/排队提示，点击或悬浮保持可见，鼠标离开区域自动收起。
6. **数据与接口抽象**：通过 JSON + `modelService` 统一管理所有模型、任务、推理与拓扑数据，为后续替换真实后端打好接口基础。
7. **视觉素材统一**：所有豆腐块配图替换为与集装箱/吊机/堆场等场景相关的高清图，提高展示沉浸感。
8. **多次迭代优化**：包括训练任务切换逻辑、联邦拓扑位置关系、通知与拓扑 popover 的交互策略等，确保演示流程顺畅。

> 后续若需对接真实训练/推理/监控服务，只需在 `modelService`、`networkTopology` 等数据层替换为 API 调用，其余 UI 可保持不变。
