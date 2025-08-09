'use client';

import { useState } from 'react';
import { Typography, Form, Input, InputNumber, DatePicker, Button, Card, Space, message, Spin } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { MainLayout } from '../components/Layout/MainLayout';
import { getContractConfig } from '../config/contracts';
import { useCreateProject } from '../hooks/useContractWrite';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CreateProjectForm {
  name: string;
  description: string;
  targetAmount: number;
  endDate: dayjs.Dayjs;
  maxParticipants: number;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const { address, chain } = useAccount();
  const [form] = Form.useForm<CreateProjectForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取合约配置
  const contractConfig = chain?.id ? getContractConfig(chain.id) : null;

  // 创建项目的hook
  const { createProject, error, isPending, isConfirming, isSuccess, isLoading } = useCreateProject();

  // 处理表单提交
  const handleSubmit = async (values: CreateProjectForm) => {
    if (!address) {
      message.error('请先连接钱包');
      return;
    }

    if (!contractConfig) {
      message.error('请切换到支持的网络');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 将结束日期转换为Unix时间戳
      const endTimestamp = Math.floor(values.endDate.valueOf() / 1000);

      // 调用合约创建项目
      await createProject({
        name: values.name,
        description: values.description,
        targetAmount: values.targetAmount.toString(),
        endTimestamp,
        maxParticipants: values.maxParticipants
      });
    } catch (err) {
      console.error('创建项目失败:', err);
      message.error('创建项目失败，请重试');
      setIsSubmitting(false);
    }
  };

  // 监听交易状态
  if (isSuccess) {
    message.success('项目创建成功！');
    router.push('/');
  }

  // 监听错误状态
  if (error) {
    message.error(`创建失败: ${error.message}`);
    setIsSubmitting(false);
  }

  const finalIsLoading = isLoading || isSubmitting;

  return (
    <MainLayout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
        {/* 页面头部 */}
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.back()}
              style={{ marginBottom: 16 }}
            >
              返回
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              <PlusOutlined style={{ marginRight: 8 }} />
              创建众筹项目
            </Title>
            <Text type="secondary">
              填写项目信息，创建您的众筹项目
            </Text>
          </div>

          {/* 创建表单 */}
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              disabled={isLoading}
            >
              <Form.Item
                label="项目名称"
                name="name"
                rules={[
                  { required: true, message: '请输入项目名称' },
                  { min: 2, max: 100, message: '项目名称长度应在2-100字符之间' }
                ]}
              >
                <Input 
                  placeholder="输入您的项目名称"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="项目描述"
                name="description"
                rules={[
                  { required: true, message: '请输入项目描述' },
                  { min: 10, max: 1000, message: '项目描述长度应在10-1000字符之间' }
                ]}
              >
                <TextArea 
                  placeholder="详细描述您的项目，包括目标、用途、预期收益等"
                  rows={6}
                  showCount
                  maxLength={1000}
                />
              </Form.Item>

              <Form.Item
                label="目标金额 (ETH)"
                name="targetAmount"
                rules={[
                  { required: true, message: '请输入目标金额' },
                  { type: 'number', min: 0.001, message: '目标金额不能少于0.001 ETH' },
                  { type: 'number', max: 10000, message: '目标金额不能超过10000 ETH' }
                ]}
              >
                <InputNumber
                  placeholder="0.1"
                  size="large"
                  style={{ width: '100%' }}
                  step={0.1}
                  precision={3}
                  addonAfter="ETH"
                />
              </Form.Item>

              <Form.Item
                label="截止日期"
                name="endDate"
                rules={[
                  { required: true, message: '请选择截止日期' },
                  {
                    validator: (_, value) => {
                      if (value && value.isBefore(dayjs().add(1, 'hour'))) {
                        return Promise.reject('截止日期必须至少在1小时后');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker
                  showTime
                  placeholder="选择项目截止日期和时间"
                  size="large"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().endOf('day')}
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>

              <Form.Item
                label="最大参与者数量"
                name="maxParticipants"
                rules={[
                  { required: true, message: '请输入最大参与者数量' },
                  { type: 'number', min: 1, message: '至少需要1个参与者' },
                  { type: 'number', max: 10000, message: '参与者数量不能超过10000' }
                ]}
              >
                <InputNumber
                  placeholder="100"
                  size="large"
                  style={{ width: '100%' }}
                  min={1}
                  max={10000}
                  addonAfter="人"
                />
              </Form.Item>

              {/* 提交按钮 */}
              <Form.Item style={{ marginTop: 32 }}>
                <Space size="middle">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={finalIsLoading}
                    disabled={!address || !contractConfig}
                    icon={<PlusOutlined />}
                  >
                    {isLoading ? '创建中...' : '创建项目'}
                  </Button>
                  <Button
                    size="large"
                    onClick={() => router.back()}
                    disabled={finalIsLoading}
                  >
                    取消
                  </Button>
                </Space>
              </Form.Item>

              {/* 状态提示 */}
              {!address && (
                <div style={{ marginTop: 16, padding: 16, backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: 6 }}>
                  <Text type="warning">请先连接钱包才能创建项目</Text>
                </div>
              )}

              {!contractConfig && address && (
                <div style={{ marginTop: 16, padding: 16, backgroundColor: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 6 }}>
                  <Text type="danger">请切换到Sepolia测试网</Text>
                </div>
              )}

              {finalIsLoading && (
                <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                  <Space>
                    <Spin size="small" />
                    <Text>
                      {isPending && '等待钱包确认...'}
                      {isConfirming && '交易确认中...'}
                      {isSubmitting && '处理中...'}
                    </Text>
                  </Space>
                </div>
              )}
            </Form>
          </Card>
        </Space>
      </div>
    </MainLayout>
  );
}