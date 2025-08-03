# ChainFund众筹系统

## 产品概述

本项目是一款基于以太坊 Sepolia 测试网的去中心化众筹系统，支持用户创建众筹项目并接受 ETH 投资。系统通过智能合约自动执行众筹逻辑，实现资金流向透明化、操作可追溯，同时加入参与人数限制机制，适合小型创意项目和社区活动的资金筹集场景。

## 核心功能需求

### 1. 项目创建

*   项目创建者填写基本信息（名称、描述、目标金额）

*   设置众筹周期（天数）和最大参与人数

*   提交后自动生成独立的众筹合约实例

### 2. 项目投资

*   已连接钱包用户可向众筹项目投资 ETH

*   每个钱包地址仅限投资一次

*   实时展示关键数据：已筹金额 / 目标金额、已参与人数 / 最大人数、剩余时间

*   投资金额无下限，受限于项目剩余可筹金额

### 3. 众筹结果处理

**成功条件**：截止时间前达到目标金额且未超最大人数，项目创建者可提取全部筹集资金

**失败条件**：截止时间未达目标金额或提前达最大人数但未达金额

### 4. 项目管理与浏览

*   首页展示所有众筹项目列表及关键状态

*   项目详情页展示完整信息和投资记录

*   支持按状态筛选（进行中 / 已结束 / 成功 / 失败）

### 5. 用户中心

*   展示用户创建的所有项目及状态

*   展示用户投资的所有项目及退款状态

*   提供投资记录查询功能

## 技术选型详情

### 1. 智能合约层

*   **开发语言**：Solidity 0.8.20

选择理由：内置安全检查机制，支持自定义错误类型，适合金融类合约开发，编译器优化较好

*   **开发框架**：Hardhat 2.17.0

选择理由：本地开发环境友好，内置测试工具，支持 TypeScript，插件生态丰富，部署流程简洁

*   **测试网络**：Sepolia Testnet

选择理由：稳定可靠，ETH 获取便捷，Etherscan 支持完善，适合开发测试

*   **合约交互库**：Ethers.js 6.7.0

选择理由：轻量级，TypeScript 支持完善，与 Hardhat 兼容性好，文档丰富

### 2. 前端与后端

*   **全栈框架**：Next.js 14.0.1（App Router）

选择理由：支持 SSR/SSG 提升首屏加载速度，API Routes 简化后端开发，文件路由结构清晰，React Server Components 优化性能

*   **UI 框架**：Tailwind CSS 3.3.5

选择理由：开发效率高，样式定制灵活，无需维护大量 CSS 文件，与 React 生态兼容性好

*   **组件库**：Ant Design 5.11.0

选择理由：组件丰富全面，设计规范统一，支持 React，提供完整的表单和数据展示组件，减少重复开发

*   **状态管理**：React Context + SWR 2.2.4

选择理由：适合中小型应用，数据缓存与重新验证机制完善，减少服务器请求，与 React hooks 无缝集成

*   **钱包连接**：Wagmi 1.4.12 + RainbowKit 1.0.9

选择理由：支持多钱包，自动处理链切换，内置连接状态管理，UI 友好，开发体验佳

### 3. 数据存储与工具

*   **数据库**：MySQL 8.0 + Prisma 5.6.0

选择理由：关系型数据库适合存储结构化元数据，支持事务，Prisma 提供类型安全的数据库访问层，迁移工具完善

*   **开发工具**：

    *   TypeScript 5.2.2：提供类型安全，减少运行时错误，提升代码可维护性
    
    *   ESLint + Prettier：保证代码规范一致性，自动格式化代码
    
    *   Vitest：前端单元测试框架，速度快，与 Vite 生态兼容
    
    *   Git：版本控制工具，跟踪代码变更

### 4. 部署工具

*   前端部署：Vercel

选择理由：与 Next.js 无缝集成，自动部署，全球 CDN，预览环境便捷

*   数据库部署：PlanetScale

选择理由：MySQL 兼容，无服务器架构，自动备份，分支功能适合开发测试

*   合约部署：Hardhat 内置部署脚本 + Etherscan 验证插件

选择理由：自动化部署流程，支持合约源码验证，便于区块浏览器查看

## 系统架构设计

```
用户层
    │
    ├─ 加密钱包 (MetaMask/ Coinbase Wallet等)
    │
前端层 (Next.js)
    │
    ├─ 页面组件 (项目列表/详情/创建/个人中心)
    ├─ UI组件 (Ant Design + 自定义组件)
    ├─ 状态管理 (React Context + SWR)
    ├─ 区块链交互 (Wagmi + Ethers.js)
    │
API层 (Next.js API Routes)
    │
    ├─ 项目元数据CRUD接口
    ├─ 数据查询与筛选接口
    ├─ 数据库交互层 (Prisma)
    │
数据层
    │
    ├─ 区块链 (Sepolia) - 存储合约数据与交易记录
    └─ MySQL - 存储项目元数据与扩展信息
```

## 智能合约设计

### 1. 核心合约结构

**CrowdfundingFactory（工厂合约）**

*   功能：创建众筹项目合约，管理所有项目

*   核心函数：

```
// 创建新项目并返回合约地址
function createProject(
    string memory name,
    string memory description,
    uint256 targetAmount,
    uint256 durationDays,
    uint256 maxParticipants
) external returns (address);

// 获取所有项目列表
function getAllProjects() external view returns (Project\[] memory);
```

**Crowdfunding（项目合约）**

*   功能：处理单个项目的投资、提款、退款逻辑

*   核心状态变量：

```
address public immutable creator;          // 项目创建者
string public name;                        // 项目名称
string public description;                 // 项目描述
uint256 public immutable targetAmount;     // 目标金额(wei)
uint256 public immutable endTime;          // 结束时间(timestamp)
uint256 public immutable maxParticipants;  // 最大参与人数
uint256 public currentAmount;              // 当前筹集金额
uint256 public participantsCount;          // 当前参与人数
bool public fundsWithdrawn;                // 资金是否已提取
mapping(address => uint256) public investments;  // 投资者及金额
mapping(address => bool) public hasRefunded;     // 记录是否已退款
```

*   核心函数：

```
// 投资项目
function invest() external payable;
// 项目创建者提取资金
function withdrawFunds() external;
// 投资者申请退款
function refund() external;
// 获取项目详情
function getProjectDetails() external view returns (ProjectDetails memory);
```

### 2. 关键业务逻辑

**投资逻辑**：

```
// 检查项目是否在众筹期内
// 检查投资者未参与过该项目
// 检查未超过最大参与人数
// 检查投资金额>0
// 更新当前金额和参与人数
// 记录投资者信息
// 触发Investment事件
```

**提款逻辑**：

```
// 检查调用者为项目创建者
// 检查项目已结束且达到目标金额
// 检查资金未提取过
// 转账给创建者
// 更新资金提取状态
// 触发FundsWithdrawn事件
```

**退款逻辑**：

```
// 检查项目已结束且未达到目标金额
// 检查调用者为投资者且有投资记录
// 检查未退款过
// 转账给投资者
// 更新退款状态
// 触发Refund事件
```

## 数据库设计（MySQL）

使用 Prisma 定义数据模型：

```
// 项目元数据表
model Project {
    id              String    @id @default(uuid())
    contractAddress String    @unique  // 对应链上合约地址
    creatorAddress  String             // 创建者钱包地址
    name            String
    description     String
    targetAmount    String             // 以wei为单位的字符串
    durationDays    Int
    maxParticipants Int
    createdAt       DateTime  @default(now())
    updatedAt       DateTime  @updatedAt
    investments     Investment\[]
}

// 投资记录补充表
model Investment {
    id              String    @id @default(uuid())
    projectId       String
    investorAddress String
    amount          String             // 以wei为单位的字符串
    transactionHash String    @unique
    createdAt       DateTime  @default(now())
    project         Project   @relation(fields: \[projectId], references: \[id], onDelete: Cascade)

    @@unique(\[projectId, investorAddress])
}
```

## 前端页面结构

### 1. 公共页面

*   **首页**：


    *   项目列表（Ant Design 的 Card 和 List 组件）
    *   项目筛选（Ant Design 的 Select 和 Radio 组件）
    *   钱包连接按钮（RainbowKit 组件）
    *   快捷创建项目入口

*   **项目详情页**：


    *   项目基本信息（Ant Design 的 Typography 组件）
    *   进度展示（Ant Design 的 Progress 和 Statistic 组件）
    *   倒计时（Ant Design 的 Countdown 组件）
    *   投资表单（Ant Design 的 InputNumber 和 Button 组件）
    *   操作按钮（根据状态动态显示）
    *   投资记录列表（Ant Design 的 Table 组件）

*   **创建项目页**：


    *   表单（Ant Design 的 Form 组件，包含 Input、TextArea、InputNumber 等）
    *   表单验证与提交按钮
    *   提示信息（Ant Design 的 Alert 组件）

### 2. 用户中心

*   **我的项目**：


    *   创建的项目列表（Ant Design 的 Table 组件）
    *   项目状态标签（Ant Design 的 Tag 组件）
    *   操作按钮（提款等）

*   **我的投资**：


    *   投资的项目列表
    *   投资金额与状态
    *   退款按钮（如适用）

## 开发计划（10 个工作日）

### 第 1 天：环境搭建与设计

*   初始化 Next.js 项目，配置 Tailwind 和 Ant Design

*   搭建 Hardhat 开发环境，配置 Sepolia 网络

*   设计 MySQL 数据库模型，配置 Prisma

*   设计智能合约接口与数据结构

### 第 2 天：智能合约开发

*   完成 CrowdfundingFactory 合约开发

*   完成 Crowdfunding 合约核心逻辑

*   实现事件定义与错误处理

*   编写基础单元测试

### 第 3 天：合约测试与部署

*   完善合约测试用例（覆盖主要功能与边界情况）

*   进行安全检查（重入攻击、权限控制等）

*   部署合约到 Sepolia 测试网

*   编写合约交互的 TypeScript 工具类

### 第 4 天：前端基础开发

*   实现钱包连接功能（Wagmi + RainbowKit）

*   开发页面布局组件（导航栏、页脚、容器）

*   实现全局状态管理（钱包状态、通知系统）

*   配置 Ant Design 主题与基础样式

### 第 5 天：项目列表与详情页

*   开发首页项目列表组件

*   实现项目数据查询 API 与前端对接

*   开发项目详情页布局

*   实现区块链数据查询功能

### 第 6 天：创建项目功能

*   开发创建项目表单（Ant Design Form 组件）

*   实现表单验证逻辑

*   对接合约创建项目功能

*   开发元数据存储 API（与 MySQL 交互）

### 第 7 天：投资功能

*   开发投资金额输入组件

*   实现投资交易逻辑与确认流程

*   开发交易状态更新机制

*   实现投资记录展示

### 第 8 天：结果处理功能

*   开发提款功能（项目创建者）

*   开发退款功能（投资者）

*   实现状态判断与按钮权限控制

*   开发交易结果通知系统

### 第 9 天：用户中心与优化

*   开发 "我的项目" 页面

*   开发 "我的投资" 页面

*   实现数据筛选与排序功能

*   优化页面加载速度与用户体验

### 第 10 天：测试与部署

*   进行系统集成测试

*   修复发现的 bug

*   配置 MySQL 数据库并部署

*   部署前端到 Vercel，整理项目文档

## 技术风险与应对措施

**区块链交易不确定性**

*   风险：交易可能失败或确认延迟

*   应对：实现交易状态实时更新、明确的错误提示、交易历史记录查询，使用 Ant Design 的 Spin 组件显示加载状态

**智能合约安全**

*   风险：存在漏洞可能导致资金损失

*   应对：遵循安全最佳实践，使用 ReentrancyGuard 防止重入攻击，全面测试边界条件，避免复杂逻辑

**用户体验挑战**

*   风险：区块链交互对普通用户较复杂

*   应对：简化操作流程，提供清晰指引，优化错误提示，增加操作确认步骤

**数据一致性**

*   风险：链上数据与数据库及前端展示可能不同步

* 应对：定期同步数据，提供手动刷新功能，使用 SWR 自动重新验证，实现数据同步状态指示

  
