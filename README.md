# ChainFund - 去中心化众筹平台

基于以太坊区块链的去中心化众筹平台，支持项目创建、资金募集和透明管理。

## 🌟 功能特性

- **项目创建**：用户可以创建众筹项目，设置目标金额和截止时间
- **资金投入**：支持ETH投资，实时显示募集进度
- **透明管理**：所有交易记录在区块链上，完全透明
- **自动退款**：项目失败时自动退还投资者资金
- **参与者管理**：查看项目参与者和投资金额

## 🏗️ 项目结构

```
chain-fund/
├── contract/          # 智能合约
│   ├── contracts/     # 合约源码
│   ├── scripts/       # 部署脚本
│   └── test/         # 合约测试
├── app/              # 前端应用
│   ├── app/          # Next.js 应用
│   └── components/   # React 组件
└── deploy-to-sepolia.sh  # 一键部署脚本
```

## 🚀 快速开始

### 1. 环境准备

确保您已安装：
- Node.js (v18+)
- npm
- MetaMask 钱包

### 2. 获取测试资金

访问 [Sepolia Faucet](https://sepoliafaucet.com/) 获取测试ETH

### 3. 部署合约

```bash
# 克隆项目
git clone <repository-url>
cd chain-fund

# 运行一键部署脚本
./deploy-to-sepolia.sh
```

脚本会引导您：
1. 配置环境变量（Infura URL、私钥等）
2. 安装依赖
3. 编译合约
4. 部署到Sepolia测试网

### 4. 启动前端

```bash
# 进入前端目录
cd app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看应用

### 5. 更新合约地址

部署成功后，将合约地址更新到 `app/config/contracts.ts`：

```typescript
export const contractAddresses = {
  sepolia: {
    crowdfundingFactory: "0x您的合约地址"
  }
};
```

## 📱 使用指南

### 连接钱包
1. 点击右上角"连接钱包"按钮
2. 选择MetaMask并授权连接
3. 确保切换到Sepolia测试网

### 创建项目
1. 点击"创建项目"按钮
2. 填写项目信息：
   - 项目名称
   - 项目描述
   - 目标金额（ETH）
   - 截止时间
   - 最大参与者数量
3. 确认交易并等待区块确认

### 投资项目
1. 浏览项目列表
2. 点击感兴趣的项目
3. 输入投资金额
4. 确认交易

### 提取资金
- **项目成功**：创建者可以提取所有募集资金
- **项目失败**：投资者可以提取自己的投资

## 🔧 技术栈

### 智能合约
- **Solidity**: 合约开发语言
- **Hardhat**: 开发框架
- **OpenZeppelin**: 安全合约库

### 前端
- **Next.js 15**: React框架
- **TypeScript**: 类型安全
- **Ant Design**: UI组件库
- **Wagmi**: 以太坊React Hooks
- **RainbowKit**: 钱包连接
- **TanStack Query**: 数据管理

## 🔐 安全特性

- **权限控制**: 只有项目创建者可以提取资金
- **时间锁定**: 项目有明确的截止时间
- **自动退款**: 失败项目自动处理退款

## 🧪 测试

```bash
# 运行合约测试
cd contract
npm test

# 运行前端测试
cd app
npm test
```

## 📝 合约地址

### Sepolia 测试网
- **CrowdfundingFactory**: 待部署
- **验证状态**: 待验证

## 🔗 相关链接

- [Sepolia Testnet](https://sepolia.dev/)
- [MetaMask](https://metamask.io/)
- [Hardhat](https://hardhat.org/)
- [Next.js](https://nextjs.org/)
- [Wagmi](https://wagmi.sh/)

---

**注意**: 这是一个测试项目，请不要在主网上使用真实资金。