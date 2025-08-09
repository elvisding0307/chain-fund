import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  console.log("开始验证已部署的合约...");

  // 读取部署信息
  if (!fs.existsSync('./deployments.json')) {
    console.error("未找到 deployments.json 文件，请先部署合约");
    return;
  }

  const deploymentInfo = JSON.parse(fs.readFileSync('./deployments.json', 'utf8'));
  const factoryAddress = deploymentInfo.crowdfundingFactory;
  
  console.log("合约地址:", factoryAddress);
  console.log("网络:", deploymentInfo.network);

  // 获取合约实例
  const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory");
  const factory = CrowdfundingFactory.attach(factoryAddress) as any;

  try {
    // 测试基本功能
    console.log("\n=== 验证合约功能 ===");
    
    // 获取当前项目数量
    const projectCount = await factory.getAllProjects();
    console.log("当前项目数量:", projectCount.length);

    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log("验证账户:", deployer.address);

    // 获取该账户创建的项目
    const ownerProjects = await factory.getProjectsByOwner(deployer.address);
    console.log("该账户创建的项目数量:", ownerProjects.length);

    console.log("\n✅ 合约验证成功！合约功能正常");
    
    // 输出合约信息
    console.log("\n=== 合约信息 ===");
    console.log("CrowdfundingFactory地址:", factoryAddress);
    console.log("网络:", deploymentInfo.network);
    console.log("部署时间:", deploymentInfo.timestamp);
    
    if (deploymentInfo.network === "Sepolia") {
      console.log("\nEtherscan链接:");
      console.log(`https://sepolia.etherscan.io/address/${factoryAddress}`);
    }

  } catch (error) {
    console.error("❌ 合约验证失败:", error);
  }
}

main().catch((error) => {
  console.error("验证过程中发生错误:", error);
  process.exitCode = 1;
});