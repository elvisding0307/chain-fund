'use client';

import { Typography, Card, Row, Col, Button, Progress, Tag, Space, Statistic, Empty, Spin, Alert } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DollarOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { MainLayout } from '../components/Layout/MainLayout';
import { useUserProjects, formatETH, formatTimestamp, getRemainingTime } from '../hooks/useContracts';

const { Title, Text } = Typography;

export default function MyProjectsPage() {
  const { address: userAddress, isConnected } = useAccount();
  
  // 获取用户项目
  const { projects, isLoading, error } = useUserProjects(userAddress);

  if (!isConnected) {
    return (
      <MainLayout>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
          <Alert
            message="请连接钱包"
            description="连接钱包后可以查看您创建的项目。"
            type="warning"
            showIcon
            action={
              <Button type="primary">
                连接钱包
              </Button>
            }
          />
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>加载项目中...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
          <Alert
            message="加载失败"
            description={`无法加载项目列表: ${error.message}`}
            type="error"
            showIcon
            action={
              <Button onClick={() => window.location.reload()}>
                重试
              </Button>
            }
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2}>我的项目</Title>
          <Text type="secondary">
            管理您创建的众筹项目，查看募集进度和参与者信息
          </Text>
        </div>

        {/* 创建项目按钮 */}
        <div style={{ marginBottom: 24 }}>
          <Link href="/create">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              创建新项目
            </Button>
          </Link>
        </div>

        {/* 项目列表 */}
        {projects.length === 0 ? (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  您还没有创建任何项目
                  <br />
                  <Link href="/create">
                    <Button type="primary" style={{ marginTop: 16 }}>
                      创建第一个项目
                    </Button>
                  </Link>
                </span>
              }
            />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {projects.map((project) => {
              // 计算项目状态
              const progress = project.targetAmount > 0 
                ? Math.min((Number(project.currentAmount) / Number(project.targetAmount)) * 100, 100)
                : 0;
              
              const now = Math.floor(Date.now() / 1000);
              const isExpired = Number(project.endTimestamp) <= now;
              const isSuccessful = project.currentAmount >= project.targetAmount;
              
              let statusColor = 'blue';
              let statusText = '进行中';
              
              if (isExpired) {
                if (isSuccessful) {
                  statusColor = 'green';
                  statusText = '成功完成';
                } else {
                  statusColor = 'red';
                  statusText = '未达目标';
                }
              } else if (isSuccessful) {
                statusColor = 'gold';
                statusText = '目标达成';
              }

              return (
                <Col xs={24} sm={12} lg={8} key={project.address}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    cover={
                      <div style={{ 
                        height: 160, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: 'bold'
                      }}>
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                    }
                    actions={[
                      <Link key="view" href={`/project/${project.address}`}>
                        <Button type="text" icon={<EyeOutlined />}>
                          查看详情
                        </Button>
                      </Link>,
                      <Button key="manage" type="text" icon={<EditOutlined />}>
                        管理项目
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                          }}>
                            <Text strong ellipsis style={{ flex: 1 }}>
                              {project.name}
                            </Text>
                            <Tag color={statusColor}>{statusText}</Tag>
                          </div>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                          <Text ellipsis style={{ height: 40 }}>
                            {project.description}
                          </Text>
                          
                          {/* 募集进度 */}
                          <div>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              marginBottom: 4 
                            }}>
                              <Text type="secondary">募集进度</Text>
                              <Text strong>{progress.toFixed(1)}%</Text>
                            </div>
                            <Progress 
                              percent={progress} 
                              size="small"
                              status={isSuccessful ? 'success' : 'active'}
                              showInfo={false}
                            />
                          </div>
                          
                          {/* 统计信息 */}
                          <Row gutter={16}>
                            <Col span={12}>
                              <Statistic
                                title="已募集"
                                value={formatETH(project.currentAmount)}
                                suffix="ETH"
                                precision={3}
                                valueStyle={{ fontSize: 14 }}
                              />
                            </Col>
                            <Col span={12}>
                              <Statistic
                                title="目标"
                                value={formatETH(project.targetAmount)}
                                suffix="ETH"
                                precision={3}
                                valueStyle={{ fontSize: 14 }}
                              />
                            </Col>
                          </Row>
                          
                          <Row gutter={16}>
                            <Col span={12}>
                              <Statistic
                                title="参与者"
                                value={Number(project.participantsCount)}
                                valueStyle={{ fontSize: 14 }}
                              />
                            </Col>
                            <Col span={12}>
                              <div>
                                <div style={{ fontSize: 12, color: '#999' }}>剩余时间</div>
                                <div style={{ 
                                  fontSize: 14, 
                                  fontWeight: 500,
                                  color: isExpired ? '#ff4d4f' : '#52c41a'
                                }}>
                                  {getRemainingTime(project.endTimestamp)}
                                </div>
                              </div>
                            </Col>
                          </Row>
                          
                          {/* 操作提示 */}
                          {isSuccessful && !isExpired && (
                            <Alert
                              message="目标已达成！"
                              type="success"
                              showIcon
                            />
                          )}
                          
                          {isExpired && isSuccessful && (
                            <Alert
                              message="可以提取资金"
                              type="info"
                              showIcon
                              action={
                                <Link href={`/project/${project.address}`}>
                                  <Button size="small" type="link" icon={<DollarOutlined />}>
                                    提取
                                  </Button>
                                </Link>
                              }
                            />
                          )}
                          
                          {isExpired && !isSuccessful && (
                            <Alert
                              message="项目未达目标"
                              type="warning"
                              showIcon
                            />
                          )}
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* 项目统计摘要 */}
        {projects.length > 0 && (
          <Card title="项目统计" style={{ marginTop: 32 }}>
            <Row gutter={24}>
              <Col xs={24} sm={6}>
                <Statistic
                  title="总项目数"
                  value={projects.length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="成功项目"
                  value={projects.filter((p: any) => {
                    const now = Math.floor(Date.now() / 1000);
                    const isExpired = Number(p.endTimestamp) <= now;
                    const isSuccessful = p.currentAmount >= p.targetAmount;
                    return isExpired && isSuccessful;
                  }).length}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="总募集金额"
                  value={formatETH(
                    BigInt(projects.reduce((sum: number, p: any) => sum + Number(p.currentAmount), 0))
                  )}
                  suffix="ETH"
                  precision={3}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="总参与者"
                  value={projects.reduce((sum: number, p: any) => sum + Number(p.participantsCount), 0)}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}