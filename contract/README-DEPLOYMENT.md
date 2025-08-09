# 部署到Sepolia测试网指南

## 前置条件

1. **获取Sepolia测试ETH**
   - 访问 [Sepolia Faucet](https://sepoliafaucet.com/) 或 [Alchemy Faucet](https://sepoliafaucet.com/)
   - 使用你的钱包地址获取测试ETH

2. **获取Infura项目ID**
   - 注册 [Infura](https://infura.io/) 账户
   - 创建新项目并获取项目ID

3. **获取Etherscan API Key（可选）**
   - 注册 [Etherscan](https://etherscan.io/) 账户
   - 在API Keys页面创建新的API Key

## 配置步骤

### 1. 环境变量配置

复制环境变量模板文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的实际值：
```bash
# Sepolia Network Configuration
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_ACTUAL_INFURA_PROJECT_ID
PRIVATE_KEY=your_actual_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_actual_etherscan_api_key
```

**⚠️ 安全提醒：**
- 永远不要将 `.env` 文件提交到版本控制系统
- 确保你的私钥安全，只在测试网络使用测试私钥
- 不要在生产环境中使用测试私钥

### 2. 安装依赖

```bash
npm install
```

### 3. 编译合约

```bash
npx hardhat compile
```

## 部署合约

### 部署到Sepolia测试网

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### 部署到本地Hardhat网络（测试用）

```bash
npx hardhat run scripts/deploy.ts --network hardhat
```

## 验证合约（可选）

部署成功后，可以在Etherscan上验证合约源码：

```bash
npx hardhat verify --network sepolia <FACTORY_CONTRACT_ADDRESS>
```

其中 `<FACTORY_CONTRACT_ADDRESS>` 是部署脚本输出的CrowdfundingFactory合约地址。

## 部署信息

部署成功后，合约地址和相关信息会保存在 `deployments.json` 文件中，包含：
- 网络信息
- 合约地址
- 部署者地址
- 部署时间戳

## 故障排除

### 常见错误

1. **insufficient funds for intrinsic transaction cost**
   - 确保你的钱包有足够的Sepolia ETH
   - 从水龙头获取更多测试ETH

2. **invalid project id**
   - 检查Infura项目ID是否正确
   - 确保项目已启用Sepolia网络

3. **private key error**
   - 确保私钥格式正确（不包含0x前缀）
   - 确保私钥对应的地址有足够余额

### 检查部署状态

可以在 [Sepolia Etherscan](https://sepolia.etherscan.io/) 上查看：
- 交易状态
- 合约地址
- Gas使用情况

## 下一步

部署成功后，你可以：
1. 在前端应用中使用部署的合约地址
2. 通过Etherscan与合约交互
3. 编写脚本测试合约功能
4. 集成到你的DApp中