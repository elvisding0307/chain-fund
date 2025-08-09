import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  console.log("开始部署合约...");

  // 获取所有配置的账户
  const signers = await ethers.getSigners();
  console.log(`\n=== 可用账户信息 (共${signers.length}个) ===`);
  
  // 显示所有账户信息
  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i];
    const balance = await ethers.provider.getBalance(signer.address);
    const role = i === 0 ? "管理员" : `投资者${i}`;
    console.log(`账户${i + 1} (${role}):`);
    console.log(`  地址: ${signer.address}`);
    console.log(`  余额: ${ethers.formatEther(balance)} ETH`);
  }
  
  // 使用第一个账户作为部署者
  const deployer = signers[0];
  console.log(`\n使用账户1作为部署者: ${deployer.address}`);

  // 部署CrowdfundingFactory合约
  console.log("\n正在部署CrowdfundingFactory合约...");
  const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory");
  const crowdfundingFactory = await CrowdfundingFactory.deploy();
  await crowdfundingFactory.waitForDeployment();
  
  const factoryAddress = await crowdfundingFactory.getAddress();
  console.log("CrowdfundingFactory合约部署成功!");
  console.log("合约地址:", factoryAddress);

  // 验证部署
  console.log("\n验证合约部署...");
  const deployedCode = await ethers.provider.getCode(factoryAddress);
  if (deployedCode === "0x") {
    console.error("合约部署失败!");
    return;
  }
  
  console.log("合约部署验证成功!");
  
  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  const networkName = network.chainId === 11155111n ? "Sepolia" : network.chainId === 1337n ? "Hardhat" : "Unknown";
  
  // 输出部署信息
  console.log("\n=== 部署完成 ===");
  console.log("网络:", networkName, `(Chain ID: ${network.chainId})`);
  console.log("CrowdfundingFactory地址:", factoryAddress);
  console.log("部署者地址:", deployer.address);
  
  // 保存部署信息到文件
  const deploymentInfo = {
    network: networkName,
    chainId: network.chainId.toString(),
    crowdfundingFactory: factoryAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    './deployments.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n部署信息已保存到 deployments.json 文件");
  
  if (networkName === "Sepolia") {
    console.log("\n提示: 可以使用以下命令验证合约:");
    console.log(`npx hardhat verify --network sepolia ${factoryAddress}`);
  }
}

main().catch((error) => {
  console.error("部署过程中发生错误:", error);
  process.exitCode = 1;
});