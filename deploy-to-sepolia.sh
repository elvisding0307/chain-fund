#!/bin/bash

# ChainFund 合约部署脚本
# 用于将合约部署到Sepolia测试网

echo "🚀 ChainFund 合约部署脚本"
echo "================================"

# 检查是否在正确的目录
if [ ! -d "contract" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 进入合约目录
cd contract

echo "📁 当前目录: $(pwd)"

# 检查是否存在 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件，正在创建..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请编辑此文件并填入以下信息："
    echo "   - SEPOLIA_URL: Infura或Alchemy的Sepolia RPC URL"
    echo "   - ADMIN_PRIVATE_KEY: 您的钱包私钥（不包含0x前缀）"
    echo "   - ETHERSCAN_API_KEY: Etherscan API密钥（可选）"
    echo ""
    echo "编辑完成后，请重新运行此脚本"
    exit 1
fi

echo "✅ 找到 .env 配置文件"

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
else
    echo "✅ 依赖包已安装"
fi

# 编译合约
echo "🔨 编译合约..."
npx hardhat compile
if [ $? -ne 0 ]; then
    echo "❌ 合约编译失败"
    exit 1
fi
echo "✅ 合约编译成功"

# 部署合约
echo "🚀 部署合约到Sepolia测试网..."
npx hardhat run scripts/deploy.ts --network sepolia
if [ $? -ne 0 ]; then
    echo "❌ 合约部署失败"
    echo "请检查："
    echo "   1. .env 文件中的配置是否正确"
    echo "   2. 钱包是否有足够的Sepolia ETH"
    echo "   3. 网络连接是否正常"
    exit 1
fi

echo "✅ 合约部署成功！"

# 检查部署信息文件
if [ -f "deployments.json" ]; then
    echo "📄 部署信息已保存到 deployments.json"
    echo "📋 部署详情："
    cat deployments.json | jq .
else
    echo "⚠️  未找到 deployments.json 文件"
fi

echo ""
echo "🎉 部署完成！"
echo "下一步："
echo "1. 复制 CrowdfundingFactory 合约地址"
echo "2. 更新前端配置文件 app/config/contracts.ts"
echo "3. 重启前端开发服务器"
echo ""
echo "💡 提示：您可以在 https://sepolia.etherscan.io 上查看部署的合约"