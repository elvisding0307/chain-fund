import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ChainFund众筹系统',
  projectId: 'YOUR_PROJECT_ID', // 从 WalletConnect Cloud 获取
  chains: [sepolia],
  ssr: true, // 如果你的 dApp 使用服务器端渲染 (SSR)
});