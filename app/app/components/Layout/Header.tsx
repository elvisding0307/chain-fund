'use client';

import { Layout, Menu, Button, Space } from 'antd';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Header: AntHeader } = Layout;

export function Header() {
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/',
      label: <Link href="/">首页</Link>,
    },
    {
      key: '/create',
      label: <Link href="/create">创建项目</Link>,
    },
    {
      key: '/my-projects',
      label: <Link href="/my-projects">我的项目</Link>,
    },
  ];

  return (
    <AntHeader className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-blue-600 mr-8">
            ChainFund
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[pathname]}
            items={menuItems}
            className="border-none bg-transparent"
          />
        </div>
        <Space>
          <ConnectButton />
        </Space>
      </div>
    </AntHeader>
  );
}