# CCK - Claude Code Key Manager

## 架构

### 目录结构

```
src/
├── index.ts                               # 应用程序入口
├── config/                                # 配置层
│   ├── AppConfig.ts                       # 应用配置管理
│   └── DIContainer.ts                     # 依赖注入容器
├── presentation/                          # 表现层（最外层）
│   ├── cli/                               # CLI 应用核心
│   │   ├── CLIApp.ts                      # CLI 应用主类
│   │   ├── CommandDispatcher.ts           # 命令分发器
│   │   └── ErrorHandler.ts                # 错误处理器
│   └── commands/                          # 命令实现
│       ├── BaseCommand.ts                 # 命令基类
│       ├── launcher/                      # 启动相关命令
│       └── management/                    # 管理相关命令
├── application/                           # 应用层（用例层）
│   ├── dto/                               # 数据传输对象
│   ├── ports/                             # 端口（接口定义）
│   │   ├── IKeySelector.ts                # 密钥选择器接口
│   │   ├── ILogger.ts                     # 日志接口
│   │   └── IProcessLauncher.ts            # 进程启动器接口
│   └── use-cases/                         # 用例实现
│       ├── cli-launcher/                  # CLI 启动用例
│       └── key-management/                # 密钥管理用例
├── core/                                  # 核心层（领域层）
│   ├── entities/                          # 实体
│   │   ├── ApiKey.ts                      # API 密钥实体
│   │   └── KeyCollection.ts               # 密钥集合实体
│   ├── repositories/                      # 仓储接口
│   │   ├── IKeyRepository.ts              # 密钥仓储接口
│   │   └── ICacheRepository.ts            # 缓存仓储接口
│   └── value-objects/                     # 值对象
│       ├── KeyName.ts                     # 密钥名称值对象
│       └── BaseUrl.ts                     # 基础 URL 值对象
├── infrastructure/                        # 基础设施层（最内层）
│   ├── adapters/                          # 适配器实现
│   │   ├── FzfKeySelector.ts              # fzf 密钥选择器
│   │   ├── FallbackKeySelector.ts         # 备用选择器
│   │   └── NodeProcessLauncher.ts         # Node 进程启动器
│   ├── repositories/                      # 仓储实现
│   │   ├── JsonKeyRepository.ts           # JSON 文件仓储
│   │   └── FileSystemCacheRepository.ts   # 文件系统缓存
│   ├── logger/                            # 日志实现
│   │   └── ConsoleLogger.ts               # 控制台日志
│   └── file-system/                       # 文件系统抽象
│       └── FileSystem.ts                  # 文件系统接口
└── shared/                                # 共享层
    ├── constants/                         # 常量定义
    └── errors/                            # 错误类定义
```

### 架构层次

#### 1. **表现层（Presentation Layer）**
- **职责**：处理用户交互、命令解析、错误展示
- **组件**：
  - `CLIApp`: CLI 应用主类，负责命令注册和路由
  - `CommandDispatcher`: 命令分发器，管理命令映射和执行
  - `*Command`: 各种命令实现，调用用例层完成业务逻辑
  - `ErrorHandler`: 统一错误处理和用户友好的错误提示

#### 2. **应用层（Application Layer）**
- **职责**：实现业务用例，协调领域对象完成业务操作
- **组件**：
  - **用例（Use Cases）**：
    - `AddKeyUseCase`: 添加密钥
    - `RemoveKeyUseCase`: 删除密钥
    - `ListKeysUseCase`: 列出密钥
    - `SwitchKeyUseCase`: 切换默认密钥
    - `LaunchClaudeUseCase`: 启动 Claude CLI
  - **端口（Ports）**：定义接口契约，不依赖具体实现
  - **DTO**：数据传输对象，用于层间数据传递

#### 3. **核心层（Core/Domain Layer）**
- **职责**：包含业务实体、业务规则和仓储接口
- **组件**：
  - **实体（Entities）**：
    - `ApiKey`: API 密钥实体，包含密钥信息和业务规则
    - `KeyCollection`: 密钥集合，管理多个密钥
  - **值对象（Value Objects）**：
    - `KeyName`: 密钥名称，包含验证逻辑
    - `BaseUrl`: 基础 URL，包含格式验证
  - **仓储接口（Repository Interfaces）**：定义数据访问契约

#### 4. **基础设施层（Infrastructure Layer）**
- **职责**：实现技术细节，如文件系统、外部服务调用
- **组件**：
  - **仓储实现**：
    - `JsonKeyRepository`: JSON 文件存储实现
    - `FileSystemCacheRepository`: 文件系统缓存实现
  - **适配器（Adapters）**：
    - `FzfKeySelector`: fzf 交互式选择器
    - `FallbackKeySelector`: 备用选择器
    - `NodeProcessLauncher`: Node.js 进程启动器
  - **工具类**：
    - `ConsoleLogger`: 控制台日志实现
    - `FileSystem`: 文件系统操作封装

### 依赖关系

```
表现层 → 应用层 → 核心层 ← 基础设施层
  ↓        ↓        ↑         ↑
  └────────┴────────┴─────────┘
        依赖注入容器（DIContainer）
```

- **依赖方向**：外层依赖内层，内层不依赖外层
- **依赖注入**：通过 `DIContainer` 管理所有依赖，实现控制反转（IoC）
- **接口隔离**：通过端口（Ports）定义接口，基础设施层实现接口

### 设计模式

1. **依赖注入（Dependency Injection）**
   - `DIContainer` 统一管理依赖，支持单例和工厂模式

2. **策略模式（Strategy Pattern）**
   - `IKeySelector` 接口，支持多种选择策略（fzf、fallback）

3. **装饰器模式（Decorator Pattern）**
   - `FzfKeySelector` 装饰 `FallbackKeySelector`，提供降级能力

4. **命令模式（Command Pattern）**
   - `BaseCommand` 抽象类，所有命令统一接口

5. **仓储模式（Repository Pattern）**
   - 通过接口抽象数据访问，支持不同存储实现

### 数据流

```
用户输入 → CLIApp → CommandDispatcher → Command
                                    ↓
                            UseCase (应用层)
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            Entity/ValueObject              Repository (接口)
            (核心层)                              ↓
                                        Repository (实现)
                                        (基础设施层)
```

## 开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format
```