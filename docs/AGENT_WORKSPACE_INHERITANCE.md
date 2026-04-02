# 子代理工作区继承机制

## 问题
多个子代理（美术、开发员、主程序）各自有独立工作区，可能导致：
- 代码产物分散在多个工作区
- 需要手动合并代码
- 版本控制混乱

## 解决方案

### 1. 项目工作区继承
所有子代理**继承项目工作区**，不使用个人工作区：

```typescript
// 子代理启动时指定 cwd
sessions_spawn({
  cwd: '/path/to/project',  // 强制项目路径
  task: '...',
})
```

### 2. 路径强制验证
WorkspaceValidator 禁止写入个人工作区：

```typescript
// 禁止写入的路径
const forbiddenPaths = [
  '~/.openclaw/workspace-art-director/',
  '~/.openclaw/workspace-developer/',
  '~/.openclaw/workspace-lead-developer/',
  // ...
];

// 验证时检查
if (targetPath.startsWith(forbiddenPath)) {
  throw new Error('禁止写入个人工作区');
}
```

### 3. 任务模板
所有子代理任务必须包含：

```
### 工作区约束（强制）

**必须写入**: `/path/to/project/src/`
**禁止写入**: `~/.openclaw/workspace-xxx/` (个人工作区)
```

## 实现细节

### 项目配置
```json
{
  "workspaceConstraints": {
    "enforceProjectWorkspace": true,
    "disableAgentWorkspace": true,
    "allowedPaths": ["src/", "docs/", "assets/", "dist/"],
    "forbiddenPaths": [
      "~/.openclaw/workspace-art-director/",
      "~/.openclaw/workspace-developer/"
    ]
  }
}
```

### 子代理启动流程
```
1. 父代理 (chief-architect) 指定项目路径
2. sessions_spawn({ cwd: projectPath })
3. 子代理继承项目路径作为工作目录
4. 所有写入操作在项目路径内
5. WorkspaceValidator 拦截违规写入
```

## 最佳实践

### 多代理协作模式
```
项目工作区: /path/to/project/
├── src/
│   ├── frontend/     ← 美术输出
│   ├── backend/      ← 开发员输出
│   └── core/         ← 架构师输出
├── docs/
│   ├── design/       ← 美术文档
│   ├── architecture/ ← 架构师文档
│   └── api/          ← 开发员文档
├── assets/
│   ├── images/       ← 美术素材
│   └── fonts/        ← 美术素材
└── dist/             ← 构建产物
```

### 角色输出路径映射
| 角色 | 源代码 | 文档 | 资源 |
|------|--------|------|------|
| 美术 | `src/frontend/` | `docs/design/` | `assets/images/` |
| 开发员 | `src/backend/` | `docs/api/` | - |
| 架构师 | `src/core/` | `docs/architecture/` | - |
| 主程序 | `src/` | `docs/` | - |

## 验证检查

### 启动时检查
```bash
# 检查子代理工作目录
ps aux | grep "node.*agent"

# 检查项目文件
find /path/to/project -name "*.ts" -o -name "*.tsx"
```

### 定期审计
```typescript
// 扫描各工作区是否有项目代码
const workspaces = ['workspace-art-director', 'workspace-developer'];
for (const ws of workspaces) {
  const files = findDevFlowFiles(ws);
  if (files.length > 0) {
    console.warn(`发现分散代码: ${ws}`);
  }
}
```

## 总结

| 机制 | 实现 | 状态 |
|------|------|------|
| cwd 继承 | sessions_spawn({ cwd }) | ✅ 已实现 |
| 路径验证 | WorkspaceValidator | ✅ 已实现 |
| 任务模板 | 文档约束 | ✅ 已实现 |
| 禁止个人工作区 | forbiddenPaths | ✅ 已实现 |

---

**创建时间**: 2026-04-02 00:12 GMT+8