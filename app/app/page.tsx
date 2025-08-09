'use client';

import { Typography, Card, Row, Col, Button, Progress, Tag, Space, Spin, Alert } from 'antd';
import { PlusOutlined, ClockCircleOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons';
import { MainLayout } from './components/Layout/MainLayout';
import ContractStatus from './components/ContractStatus';
import { useAllProjects, formatETH, getRemainingTime } from './hooks/useContracts';
import { useAccount } from 'wagmi';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;



export default function Home() {
  const { projects, isLoading, error, contractConfig } = useAllProjects();
  const { isConnected, chain } = useAccount();

  // 检查是否连接到正确的网络
  const isCorrectNetwork = chain?.id === 11155111; // Sepolia
  const hasValidContract = contractConfig?.crowdfundingFactory.address !== '0x0000000000000000000000000000000000000000';

  // 如果系统未就绪，显示状态页面
  if (!hasValidContract) {
    return (
      <MainLayout>
        <ContractStatus 
          hasValidContract={hasValidContract}
          isCorrectNetwork={isCorrectNetwork}
          isConnected={isConnected}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Title level={1} className="text-white mb-4">
                ChainFund 众筹系统
              </Title>
              <Paragraph className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                基于区块链技术的去中心化众筹平台，让创新项目获得透明、安全的资金支持
              </Paragraph>
              <Space size="large">
                <Link href="/create">
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<PlusOutlined />}
                    className="bg-white text-blue-600 border-white hover:bg-blue-50"
                    disabled={!isConnected || !isCorrectNetwork || !hasValidContract}
                  >
                    创建项目
                  </Button>
                </Link>
                <Button 
                  size="large" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  了解更多
                </Button>
              </Space>
            </div>
          </div>
        </div>

        {/* Network Status */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {!isConnected && (
            <Alert
              message="请连接钱包"
              description="您需要连接钱包才能查看和参与众筹项目"
              type="warning"
              showIcon
              icon={<WalletOutlined />}
              className="mb-4"
            />
          )}
          {isConnected && !isCorrectNetwork && (
            <Alert
              message="网络错误"
              description="请切换到Sepolia测试网络"
              type="error"
              showIcon
              className="mb-4"
            />
          )}
          {isConnected && isCorrectNetwork && !hasValidContract && (
            <Alert
              message="合约未部署"
              description="ChainFund合约尚未部署到当前网络，请联系管理员"
              type="info"
              showIcon
              className="mb-4"
            />
          )}
        </div>

        {/* Projects Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <Title level={2}>众筹项目</Title>
            <Text type="secondary" className="text-lg">
              {isConnected && isCorrectNetwork && hasValidContract 
                ? '发现和支持优秀的区块链创新项目'
                : '连接钱包并切换到Sepolia网络查看项目'
              }
            </Text>
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <Spin size="large" />
              <div className="mt-4">
                <Text type="secondary">正在加载项目数据...</Text>
              </div>
            </div>
          )}

          {error && (
            <Alert
              message="加载失败"
              description={`无法加载项目数据: ${error.message}`}
              type="error"
              showIcon
              className="mb-4"
            />
          )}

          {!isLoading && !error && projects.length === 0 && isConnected && isCorrectNetwork && hasValidContract && (
            <div className="text-center py-12">
              <Text type="secondary" className="text-lg">
                暂无众筹项目，成为第一个创建项目的人吧！
              </Text>
            </div>
          )}

          {!isLoading && projects.length > 0 && (
            <Row gutter={[24, 24]}>
              {projects.map((project) => {
                const progress = Number(project.currentAmount) / Number(project.targetAmount) * 100;
                const targetETH = formatETH(project.targetAmount);
                const currentETH = formatETH(project.currentAmount);
                const remainingTime = getRemainingTime(project.endTimestamp);
                
                return (
                  <Col xs={24} sm={12} lg={8} key={project.address}>
                    <Card
                      hoverable
                      className="h-full"
                      cover={
                        <div style={{ 
                          height: 200, 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '24px',
                          fontWeight: 'bold'
                        }}>
                          {project.name.charAt(0).toUpperCase()}
                        </div>
                      }
                      actions={[
                        <Link href={`/project/${project.address}`} key="view">
                          <Button 
                            type="primary" 
                            block
                            disabled={!project.isActive}
                          >
                            {project.isActive ? '查看详情' : '已结束'}
                          </Button>
                        </Link>
                      ]}
                    >
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <Title level={4} className="mb-0 line-clamp-1">
                              {project.name || '未命名项目'}
                            </Title>
                            <Tag color={project.isActive ? 'blue' : 'default'}>
                              {project.isActive ? '进行中' : '已结束'}
                            </Tag>
                          </div>
                          <Text type="secondary" className="line-clamp-2">
                            {project.description || '暂无描述'}
                          </Text>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <Text strong>{currentETH} ETH</Text>
                            <Text type="secondary">目标: {targetETH} ETH</Text>
                          </div>
                          <Progress 
                            percent={Math.round(progress)}
                            strokeColor={{
                              '0%': '#108ee9',
                              '100%': '#87d068',
                            }}
                          />
                        </div>

                        <div className="flex justify-between text-sm">
                          <Space>
                            <UserOutlined />
                            <Text>{Number(project.participantsCount)} 参与者</Text>
                          </Space>
                          <Space>
                            <ClockCircleOutlined />
                            <Text>{remainingTime}</Text>
                          </Space>
                        </div>

                        <div>
                          <Text type="secondary" className="text-xs">
                            创建者: {project.owner.slice(0, 6)}...{project.owner.slice(-4)}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
