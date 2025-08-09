'use client';

import { useState } from 'react';
import { Card, Button, Alert, Steps, Typography, Space, Divider } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAccount } from 'wagmi';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface ContractStatusProps {
  hasValidContract: boolean;
  isCorrectNetwork: boolean;
  isConnected: boolean;
}

export default function ContractStatus({ hasValidContract, isCorrectNetwork, isConnected }: ContractStatusProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const { address } = useAccount();

  const handleDeploy = async () => {
    setIsDeploying(true);
    // 这里应该调用部署脚本或者显示部署指南
    // 由于我们不能直接在前端部署合约，这里只是演示
    setTimeout(() => {
      setIsDeploying(false);
    }, 3000);
  };

  const getStepStatus = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return isConnected ? 'finish' : 'wait';
      case 1:
        return isConnected && isCorrectNetwork ? 'finish' : isConnected ? 'error' : 'wait';
      case 2:
        return hasValidContract ? 'finish' : isCorrectNetwork ? 'process' : 'wait';
      default:
        return 'wait';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <div className="text-center mb-6">
          <Title level={2}>ChainFund 系统状态</Title>
          <Paragraph type="secondary">
            请按照以下步骤完成系统初始化
          </Paragraph>
        </div>

        <Steps direction="vertical" current={hasValidContract ? 3 : isCorrectNetwork ? 2 : isConnected ? 1 : 0}>
          <Step
            title="连接钱包"
            description="连接您的Web3钱包"
            status={getStepStatus(0)}
            icon={isConnected ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          />
          <Step
            title="切换网络"
            description="切换到Sepolia测试网络"
            status={getStepStatus(1)}
            icon={isCorrectNetwork ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
          />
          <Step
            title="部署合约"
            description="部署ChainFund智能合约"
            status={getStepStatus(2)}
            icon={hasValidContract ? <CheckCircleOutlined /> : isDeploying ? <LoadingOutlined /> : <ExclamationCircleOutlined />}
          />
        </Steps>

        <Divider />

        {!isConnected && (
          <Alert
            message="请连接钱包"
            description="点击右上角的'连接钱包'按钮连接您的Web3钱包"
            type="warning"
            showIcon
            className="mb-4"
          />
        )}

        {isConnected && !isCorrectNetwork && (
          <Alert
            message="网络错误"
            description="请在钱包中切换到Sepolia测试网络"
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        {isConnected && isCorrectNetwork && !hasValidContract && (
          <div>
            <Alert
              message="合约未部署"
              description="ChainFund合约尚未部署到Sepolia网络，需要先部署合约才能使用系统"
              type="info"
              showIcon
              className="mb-4"
            />
            
            <Card title="部署指南" className="mb-4">
              <div className="space-y-4">
                <div>
                  <Title level={4}>方法一：使用命令行部署</Title>
                  <Paragraph>
                    如果您有合约源码，可以按照以下步骤部署：
                  </Paragraph>
                  <div className="bg-gray-100 p-4 rounded">
                    <pre className="text-sm">
{`# 1. 进入合约目录
cd /root/chain-fund/contract

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的私钥和Infura项目ID

# 3. 安装依赖
npm install

# 4. 部署合约
npm run deploy:sepolia`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <Title level={4}>方法二：使用已部署的合约</Title>
                  <Paragraph>
                    如果合约已经部署，请更新 <code>app/config/contracts.ts</code> 文件中的合约地址。
                  </Paragraph>
                </div>
              </div>
            </Card>

            <div className="text-center">
              <Space>
                <Button 
                  type="primary" 
                  loading={isDeploying}
                  onClick={handleDeploy}
                  disabled
                >
                  {isDeploying ? '部署中...' : '自动部署（开发中）'}
                </Button>
                <Button href="https://sepoliafaucet.com/" target="_blank">
                  获取测试ETH
                </Button>
              </Space>
            </div>
          </div>
        )}

        {hasValidContract && (
          <Alert
            message="系统就绪"
            description={`ChainFund系统已成功初始化，您可以开始创建和参与众筹项目了！当前钱包：${address?.slice(0, 6)}...${address?.slice(-4)}`}
            type="success"
            showIcon
            className="mb-4"
          />
        )}
      </Card>
    </div>
  );
}