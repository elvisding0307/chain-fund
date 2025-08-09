'use client';

import { useReadContract, useReadContracts, useAccount } from 'wagmi';
import { getContractConfig, ProjectInfo } from '../config/contracts';
import { formatEther, Abi } from 'viem';
import { useMemo } from 'react';

// 使用CrowdfundingFactory合约获取所有项目
export function useAllProjects() {
  const { chain } = useAccount();
  
  const contractConfig = useMemo(() => {
    if (!chain?.id) return null;
    try {
      return getContractConfig(chain.id);
    } catch {
      return null;
    }
  }, [chain?.id]);

  const { data: projectAddresses, isLoading: isLoadingAddresses, error: addressError } = useReadContract({
    address: contractConfig?.crowdfundingFactory.address as `0x${string}`,
    abi: contractConfig?.crowdfundingFactory.abi as Abi,
    functionName: 'getAllProjects',
    query: {
      enabled: !!contractConfig && contractConfig.crowdfundingFactory.address !== '0x0000000000000000000000000000000000000000'
    }
  });

  // 获取每个项目的详细信息
  const projectContracts = useMemo(() => {
    if (!projectAddresses || !contractConfig) return [];
    
    return (projectAddresses as string[]).map(address => ({
      address: address as `0x${string}`,
      abi: contractConfig.crowdfunding.abi as Abi,
      functionName: 'getAllInformation' as const
    }));
  }, [projectAddresses, contractConfig]);

  const { data: projectsData, isLoading: isLoadingProjects, error: projectsError } = useReadContracts({
    contracts: projectContracts,
    query: {
      enabled: projectContracts.length > 0
    }
  });

  // 处理项目数据
  const projects = useMemo(() => {
    if (!projectsData || !projectAddresses) return [];
    
    return projectsData.map((result, index) => {
      if (result.status !== 'success' || !result.result) {
        return null;
      }
      
      const [name, description, targetAmount, currentAmount, endTimestamp, maxParticipants, participantsCount, owner, isActive] = result.result as [string, string, bigint, bigint, bigint, bigint, bigint, string, boolean];
      
      return {
        address: (projectAddresses as string[])[index],
        name,
        description,
        targetAmount,
        currentAmount,
        endTimestamp,
        maxParticipants,
        participantsCount,
        owner,
        isActive
      } as ProjectInfo;
    }).filter(Boolean) as ProjectInfo[];
  }, [projectsData, projectAddresses]);

  return {
    projects,
    isLoading: isLoadingAddresses || isLoadingProjects,
    error: addressError || projectsError,
    contractConfig
  };
}

// 获取用户创建的项目
export function useUserProjects(userAddress?: string) {
  const { address, chain } = useAccount();
  const targetAddress = userAddress || address;
  
  const contractConfig = useMemo(() => {
    if (!chain?.id) return null;
    try {
      return getContractConfig(chain.id);
    } catch {
      return null;
    }
  }, [chain?.id]);

  const { data: userProjectAddresses, isLoading: isLoadingAddresses, error: addressesError } = useReadContract({
    address: contractConfig?.crowdfundingFactory.address as `0x${string}`,
    abi: contractConfig?.crowdfundingFactory.abi as Abi,
    functionName: 'getProjectsByOwner',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress && !!contractConfig && contractConfig.crowdfundingFactory.address !== '0x0000000000000000000000000000000000000000'
    }
  });

  // 为每个项目地址创建合约调用
  const projectContracts = useMemo(() => {
    if (!userProjectAddresses || !contractConfig) return [];
    
    return (userProjectAddresses as string[]).map(address => ({
      address: address as `0x${string}`,
      abi: contractConfig.crowdfunding.abi as Abi,
      functionName: 'getAllInformation'
    }));
  }, [userProjectAddresses, contractConfig]);

  const { data: projectsData, isLoading: isLoadingProjects, error: projectsError } = useReadContracts({
    contracts: projectContracts,
    query: {
      enabled: projectContracts.length > 0
    }
  });

  // 处理项目数据
  const projects = useMemo(() => {
    if (!projectsData || !userProjectAddresses) return [];
    
    return projectsData.map((result, index) => {
      if (result.status !== 'success' || !result.result) {
        return null;
      }
      
      const [name, description, targetAmount, currentAmount, endTimestamp, maxParticipants, participantsCount, owner, isActive] = result.result as [string, string, bigint, bigint, bigint, bigint, bigint, string, boolean];
      
      return {
        address: (userProjectAddresses as string[])[index],
        name,
        description,
        targetAmount,
        currentAmount,
        endTimestamp,
        maxParticipants,
        participantsCount,
        owner,
        isActive
      } as ProjectInfo;
    }).filter(Boolean) as ProjectInfo[];
  }, [projectsData, userProjectAddresses]);

  return {
    projects,
    isLoading: isLoadingAddresses || isLoadingProjects,
    error: addressesError || projectsError
  };
}

// 获取单个项目的详细信息
export function useProjectDetails(projectAddress: string) {
  const { chain } = useAccount();
  
  const contractConfig = useMemo(() => {
    if (!chain?.id) return null;
    try {
      return getContractConfig(chain.id);
    } catch {
      return null;
    }
  }, [chain?.id]);

  const { data: projectData, isLoading, error } = useReadContract({
    address: projectAddress as `0x${string}`,
    abi: contractConfig?.crowdfunding.abi as Abi,
    functionName: 'getAllInformation',
    query: {
      enabled: !!projectAddress && !!contractConfig
    }
  });

  const project = useMemo(() => {
    if (!projectData) return null;
    
    const [name, description, targetAmount, currentAmount, endTimestamp, maxParticipants, participantsCount, owner, isActive] = projectData as [string, string, bigint, bigint, bigint, bigint, bigint, string, boolean];
    
    return {
      address: projectAddress,
      name,
      description,
      targetAmount,
      currentAmount,
      endTimestamp,
      maxParticipants,
      participantsCount,
      owner,
      isActive
    } as ProjectInfo;
  }, [projectData, projectAddress]);

  return {
    project,
    isLoading,
    error
  };
}

// 获取项目参与者
export function useProjectParticipants(projectAddress: string) {
  const { chain } = useAccount();
  
  const contractConfig = useMemo(() => {
    if (!chain?.id) return null;
    try {
      return getContractConfig(chain.id);
    } catch {
      return null;
    }
  }, [chain?.id]);

  const { data: participants, isLoading, error } = useReadContract({
    address: projectAddress as `0x${string}`,
    abi: contractConfig?.crowdfunding.abi as Abi,
    functionName: 'getParticipants',
    query: {
      enabled: !!projectAddress && !!contractConfig
    }
  });

  return {
    participants: participants as string[] || [],
    isLoading,
    error
  };
}

// 工具函数：格式化ETH金额
export function formatETH(amount: bigint): string {
  return formatEther(amount);
}

// 工具函数：格式化时间戳
export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 工具函数：计算剩余时间
export function getRemainingTime(endTimestamp: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const end = Number(endTimestamp);
  const remaining = end - now;
  
  if (remaining <= 0) {
    return '已结束';
  }
  
  const days = Math.floor(remaining / (24 * 60 * 60));
  const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((remaining % (60 * 60)) / 60);
  
  if (days > 0) {
    return `${days}天${hours}小时`;
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
}