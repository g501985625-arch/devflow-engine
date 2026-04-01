# DevFlow Engine - Phase 4 开发规划

> Server + Dashboard 模块开发

---

## 模块拆分

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 4 模块架构                                            │
│                                                             │
│  M9: Server (HTTP + WebSocket)                              │
│  ├── src/server/index.ts       - Fastify 服务入口           │
│  ├── src/server/routes/         - REST API 路由             │
│  │   ├── projects.ts           - 项目管理 API               │
│  │   ├── workflow.ts           - 工作流 API                 │
│  │   ├── agents.ts             - Agent 状态 API             │
│  │   └── control.ts            - 启动/暂停/恢复 API         │
│  ├── src/server/websocket.ts   - WebSocket 实时推送         │
│  └── src/server/types.ts       - Server 类型定义            │
│                                                             │
│  M10: Dashboard (React 前端)                                 │
│  ├── src/web/                   - React 应用                 │
│  │   ├── components/           - UI 组件                    │
│  │   │   ├── Dashboard.tsx     - 主仪表盘                   │
│  │   │   ├── ProjectList.tsx   - 项目列表                   │
│  │   │   ├── WorkflowGraph.tsx - 流程图                     │
│  │   │   ├── AgentCard.tsx     - Agent 卡片                 │
│  │   │   └── EventLog.tsx      - 事件日志                   │
│  │   ├── hooks/                - React Hooks                │
│  │   │   ├── useWebSocket.ts   - WebSocket 连接             │
│  │   │   ├── useProjects.ts    - 项目数据                   │
│  │   │   └── useEvents.ts      - 事件流                     │
│  │   ├── App.tsx               - 应用入口                   │
│  │   └── main.tsx              - React 入口                 │
│  └── public/                   - 静态资源                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 任务分配

### M9: Server (主程序负责)

| 任务 | 内容 | 优先级 |
|------|------|--------|
| T9-1 | Fastify 服务搭建 | P0 |
| T9-2 | REST API 路由 (projects/workflow/agents/control) | P0 |
| T9-3 | WebSocket 事件推送 | P0 |
| T9-4 | 进程管理 (PM2/systemd) | P1 |
| T9-5 | 配置文件支持 | P1 |

### M10: Dashboard (开发员负责)

| 任务 | 内容 | 优先级 |
|------|------|--------|
| T10-1 | React + Vite + Tailwind 搭建 | P0 |
| T10-2 | Dashboard 主页面 | P0 |
| T10-3 | 项目列表组件 | P0 |
| T10-4 | WebSocket 实时更新 | P0 |
| T10-5 | 流程图可视化 (ReactFlow) | P1 |
| T10-6 | Agent 状态卡片 | P1 |
| T10-7 | 事件日志组件 | P1 |

---

## API 接口设计

### REST API

```
GET    /api/status              - Engine 状态
GET    /api/config              - Engine 配置
GET    /api/projects            - 项目列表
GET    /api/projects/:id        - 项目详情
POST   /api/projects            - 创建项目
DELETE /api/projects/:id        - 删除项目
GET    /api/workflow/:id        - 工作流状态
GET    /api/agents              - Agent 状态
POST   /api/control/start       - 启动自动化
POST   /api/control/pause       - 暂停自动化
POST   /api/control/resume      - 恢复自动化
POST   /api/control/shutdown    - 关闭 Engine
```

### WebSocket Events

```
ws://localhost:3000/ws

推送事件类型 (AutomationEvent):
- started
- phase_started
- task_started
- task_completed
- task_failed
- phase_completed
- blocked
- needs_intervention
- paused
- completed
```

---

## 开发时间表

| 天数 | 主程序任务 | 开发员任务 | 同步点 |
|------|-----------|-----------|--------|
| Day 1 | T9-1, T9-2 | T10-1, T10-2 | API 接口确认 |
| Day 2 | T9-3, T9-4 | T10-3, T10-4 | WebSocket 连通测试 |
| Day 3 | T9-5 | T10-5, T10-6 | 流程图集成 |
| Day 4 | 验收 M9 | T10-7 | 交叉验证 |
| Day 5 | 交叉验证 | 交叉验证 | 上线准备 |

---

## 依赖项

```json
// 新增依赖
{
  "dependencies": {
    "fastify": "^4.26.0",
    "@fastify/websocket": "^9.0.0",
    "@fastify/cors": "^9.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "reactflow": "^11.10.0"
  }
}
```

---

## 验证共识

```
✅ 技术验证: 完全可行，现有代码可直接包装
✅ 功能测试: 满足用户需求 (后台常驻 + Web UI 监控)
✅ 风险评估: 低风险，增量开发
✅ 开发批准: 进入 Phase 4 开发阶段
```

---

**创建时间**: 2026-04-01 15:43
**验证通过**: 架构师批准