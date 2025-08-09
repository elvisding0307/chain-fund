'use client';

import { Layout } from 'antd';
import { Header } from './Header';

const { Content, Footer } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4">
          {children}
        </div>
      </Content>
      <Footer className="text-center bg-white border-t">
        <div className="max-w-7xl mx-auto">
          ChainFund众筹系统 ©2024 基于以太坊区块链技术
        </div>
      </Footer>
    </Layout>
  );
}