import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

// 获取配置的账户
function getAccounts(): string[] {
  const accounts: string[] = [];
  
  // 主账户 (部署者/管理员)
  if (process.env.ADMIN_PRIVATE_KEY && process.env.ADMIN_PRIVATE_KEY.length === 64) {
    accounts.push(process.env.ADMIN_PRIVATE_KEY);
  }
  
  // 投资者账户1
  if (process.env.INVESTOR1_PRIVATE_KEY && process.env.INVESTOR1_PRIVATE_KEY.length === 64) {
    accounts.push(process.env.INVESTOR1_PRIVATE_KEY);
  }
  
  // 投资者账户2
  if (process.env.INVESTOR2_PRIVATE_KEY && process.env.INVESTOR2_PRIVATE_KEY.length === 64) {
    accounts.push(process.env.INVESTOR2_PRIVATE_KEY);
  }
  
  // 如果没有配置账户，返回空数组
  return accounts;
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      accounts: getAccounts(),
      chainId: 11155111,
    },
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
};

export default config;
