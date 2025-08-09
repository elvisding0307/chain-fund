'use client';

import { useState } from 'react';
import { Typography, Card, Row, Col, Button, Progress, Tag, Space, Statistic, Input, Modal, message, Spin, Alert, Descriptions, List, Avatar } from 'antd';
import { ArrowLeftOutlined, WalletOutlined, UserOutlined, ClockCircleOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { MainLayout } from '../../components/Layout/MainLayout';
import { useProjectDetails, useProjectParticipants, formatETH, formatTimestamp, getRemainingTime } from '../../hooks/useContracts';
import { useFundProject, useWithdrawFunds } from '../../hooks/useContractWrite';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectAddress = params.address as string;
  const { address: userAddress, isConnected } = useAccount();
  
  // 状态管理
  const [fundAmount, setFundAmount] = useState('');
  const [isFundModalVisible, setIsFundModalVisible] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  
  // 获取项目数据
  const { project, isLoading: isProjectLoading, error: projectError } = useProjectDetails(projectAddress);
  const { participants, isLoading: isParticipantsLoading } = useProjectParticipants(projectAddress);
  
  // 合约交互hooks
  const { fundProject, isLoading: isFunding, isSuccess: fundSuccess, error: fundError } = useFundProject();
  const { withdrawFunds, isLoading: isWithdrawing, isSuccess: withdrawSuccess, error: withdrawError } = useWithdrawFunds();

  // 处理投资
  const handleFund = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      message.error('请输入有效的投资金额');
      return;
    }

    try {
      await fundProject({
        projectAddress,
        amount: fundAmount
      });
      setIsFundModalVisible(false);
      setFundAmount('');
    } catch (err) {
      console.error('投资失败:', err);
    }
  };

  // 处理提取资金
  const handleWithdraw = async () => {
    try {
      await withdrawFunds({ projectAddress });
      setIsWithdrawModalVisible(false);
    } catch (err) {
      console.error('提取失败:', err);
    }
  };

  // 监听交易成功
  if (fundSuccess) {
    message.success('投资成功！');
  }
  
  if (withdrawSuccess) {
    message.success('资金提取成功！');
  }

  // 监听交易错误
  if (fundError) {
    message.error(`投资失败: ${fundError.message}`);
  }
  
  if (withdrawError) {
    message.error(`提取失败: ${withdrawError.message}`);
  }

  if (isProjectLoading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>加载项目信息中...</div>
        </div>
      </MainLayout>
    );
  }

  if (projectError || !project) {
    return (
      <MainLayout>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
          <Alert
            message="项目加载失败"
            description="无法加载项目信息，请检查项目地址是否正确或稍后重试。"
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => router.back()}>
                返回
              </Button>
            }
          />
        </div>
      </MainLayout>
    );
  }

  // 计算进度
  const progress = project.targetAmount > 0 
    ? Math.min((Number(project.currentAmount) / Number(project.targetAmount)) * 100, 100)
    : 0;

  // 检查是否是项目所有者
  const isOwner = userAddress?.toLowerCase() === project.owner.toLowerCase();
  
  // 检查项目状态
  const now = Math.floor(Date.now() / 1000);
  const isExpired = Number(project.endTimestamp) <= now;
  const isSuccessful = project.currentAmount >= project.targetAmount;
  const canWithdraw = isOwner && (isSuccessful || isExpired);
  const canFund = !isExpired && !isSuccessful && isConnected;

  return (
    <MainLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        {/* 返回按钮 */}
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.back()}
          style={{ marginBottom: 24 }}
        >
          返回项目列表
        </Button>

        <Row gutter={[24, 24]}>
          {/* 左侧：项目详情 */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 项目基本信息 */}
              <Card>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Title level={2} style={{ margin: 0 }}>
                      {project.name}
                    </Title>
                    <Space style={{ marginTop: 8 }}>
                      <Tag color={project.isActive ? 'green' : 'red'}>
                        {project.isActive ? '进行中' : '已结束'}
                      </Tag>
                      <Tag color={isSuccessful ? 'gold' : 'blue'}>
                        {isSuccessful ? '目标达成' : '募集中'}
                      </Tag>
                      {isOwner && <Tag color="purple">我的项目</Tag>}
                    </Space>
                  </div>
                  
                  <Paragraph style={{ fontSize: 16, lineHeight: 1.6 }}>
                    {project.description}
                  </Paragraph>
                </Space>
              </Card>

              {/* 项目详细信息 */}
              <Card title="项目信息">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="项目地址" span={2}>
                    <Text code copyable>{project.address}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="项目所有者">
                    <Text code copyable>{project.owner}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    {formatTimestamp(project.endTimestamp - BigInt(30 * 24 * 60 * 60))} {/* 假设项目持续30天 */}
                  </Descriptions.Item>
                  <Descriptions.Item label="截止时间">
                    {formatTimestamp(project.endTimestamp)}
                  </Descriptions.Item>
                  <Descriptions.Item label="剩余时间">
                    <Text type={isExpired ? 'danger' : 'success'}>
                      {getRemainingTime(project.endTimestamp)}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="最大参与者">
                    {Number(project.maxParticipants)} 人
                  </Descriptions.Item>
                  <Descriptions.Item label="当前参与者">
                    {Number(project.participantsCount)} 人
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* 参与者列表 */}
              <Card 
                title={`参与者列表 (${participants.length})`}
                loading={isParticipantsLoading}
              >
                {participants.length > 0 ? (
                  <List
                    dataSource={participants}
                    renderItem={(participant, index) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={<Text code copyable>{participant}</Text>}
                          description={`参与者 #${index + 1}`}
                        />
                      </List.Item>
                    )}
                    pagination={participants.length > 10 ? { pageSize: 10 } : false}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                    暂无参与者
                  </div>
                )}
              </Card>
            </Space>
          </Col>

          {/* 右侧：投资面板 */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 募集进度 */}
              <Card>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Statistic
                    title="目标金额"
                    value={formatETH(project.targetAmount)}
                    suffix="ETH"
                    precision={3}
                  />
                  
                  <Statistic
                    title="已募集"
                    value={formatETH(project.currentAmount)}
                    suffix="ETH"
                    precision={3}
                    valueStyle={{ color: '#3f8600' }}
                  />
                  
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <Text>完成度: {progress.toFixed(1)}%</Text>
                    </div>
                    <Progress 
                      percent={progress} 
                      status={isSuccessful ? 'success' : 'active'}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />
                  </div>
                </Space>
              </Card>

              {/* 操作按钮 */}
              <Card>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {canFund && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<WalletOutlined />}
                      onClick={() => setIsFundModalVisible(true)}
                      block
                      loading={isFunding}
                    >
                      投资项目
                    </Button>
                  )}
                  
                  {canWithdraw && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<DollarOutlined />}
                      onClick={() => setIsWithdrawModalVisible(true)}
                      block
                      loading={isWithdrawing}
                      danger={!isSuccessful}
                    >
                      {isSuccessful ? '提取资金' : '项目失败，退还资金'}
                    </Button>
                  )}
                  
                  {!isConnected && (
                    <Alert
                      message="请连接钱包"
                      description="连接钱包后可以投资项目"
                      type="warning"
                      showIcon
                    />
                  )}
                  
                  {isExpired && !canWithdraw && (
                    <Alert
                      message="项目已结束"
                      description={isSuccessful ? '项目成功完成' : '项目未达到目标'}
                      type={isSuccessful ? 'success' : 'error'}
                      showIcon
                    />
                  )}
                </Space>
              </Card>

              {/* 项目统计 */}
              <Card title="项目统计">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="参与者"
                      value={Number(project.participantsCount)}
                      prefix={<TeamOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="剩余名额"
                      value={Number(project.maxParticipants) - Number(project.participantsCount)}
                      prefix={<UserOutlined />}
                    />
                  </Col>
                </Row>
              </Card>
            </Space>
          </Col>
        </Row>

        {/* 投资模态框 */}
        <Modal
          title="投资项目"
          open={isFundModalVisible}
          onOk={handleFund}
          onCancel={() => setIsFundModalVisible(false)}
          confirmLoading={isFunding}
          okText="确认投资"
          cancelText="取消"
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>项目名称：</Text>
              <Text>{project.name}</Text>
            </div>
            <div>
              <Text strong>投资金额 (ETH)：</Text>
              <Input
                placeholder="请输入投资金额"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                suffix="ETH"
                type="number"
                min="0"
                step="0.001"
              />
            </div>
            <Alert
              message="投资提醒"
              description="投资有风险，请仔细阅读项目信息后再做决定。投资后资金将锁定直到项目结束。"
              type="warning"
              showIcon
            />
          </Space>
        </Modal>

        {/* 提取资金模态框 */}
        <Modal
          title={isSuccessful ? "提取资金" : "退还资金"}
          open={isWithdrawModalVisible}
          onOk={handleWithdraw}
          onCancel={() => setIsWithdrawModalVisible(false)}
          confirmLoading={isWithdrawing}
          okText="确认提取"
          cancelText="取消"
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>项目名称：</Text>
              <Text>{project.name}</Text>
            </div>
            <div>
              <Text strong>可提取金额：</Text>
              <Text>{formatETH(project.currentAmount)} ETH</Text>
            </div>
            <Alert
              message={isSuccessful ? "恭喜项目成功！" : "项目未达成目标"}
              description={
                isSuccessful 
                  ? "您可以提取所有募集到的资金。" 
                  : "项目未达到目标金额，资金将退还给投资者。"
              }
              type={isSuccessful ? "success" : "warning"}
              showIcon
            />
          </Space>
        </Modal>
      </div>
    </MainLayout>
  );
}