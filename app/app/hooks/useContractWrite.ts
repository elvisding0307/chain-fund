'use client';

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { getContractConfig } from '../config/contracts';
import { useMemo } from 'react';

// 创建项目的参数接口
export interface CreateProjectParams {
  name: string;
  description: string;
  targetAmount: string; // ETH amount as string
  endTimestamp: number; // Unix timestamp
  maxParticipants: number;
}

// 投资项目的参数接口
export interface FundProjectParams {
  projectAddress: string;
  amount: string; // ETH amount as string
}

// 提取资金的参数接口
export interface WithdrawParams {
  projectAddress: string;
}

// 创建项目的hook
export function useCreateProject() {
  const { chain } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const contractConfig = useMemo(() => {
    if (!chain?.id) return null;
    try {
      return getContractConfig(chain.id);
    } catch {
      return null;
    }
  }, [chain?.id]);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createProject = async (params: CreateProjectParams) => {
    if (!contractConfig) {
      throw new Error('合约配置未找到，请检查网络连接');
    }

    const targetAmountWei = parseEther(params.targetAmount);

    writeContract({
      address: contractConfig.crowdfundingFactory.address as `0x${string}`,
      abi: contractConfig.crowdfundingFactory.abi,
      functionName: 'createProject',
      args: [
        params.name,
        params.description,
        targetAmountWei,
        BigInt(params.endTimestamp),
        BigInt(params.maxParticipants)
      ],
    });
  };

  return {
    createProject,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming
  };
}

// 投资项目的hook
export function useFundProject() {
  const { chain } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const contractConfig = useMemo(() => {
    if (!chain?.id) return null;
    try {
      return getContractConfig(chain.id);
    } catch {
      return null;
    }
  }, [chain?.id]);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const fundProject = async (params: FundProjectParams) => {
    if (!contractConfig) {
      throw new Error('合约配置未找到，请检查网络连接');
    }

    const amountWei = parseEther(params.amount);

    writeContract({
      address: params.projectAddress as `0x${string}`,
      abi: contractConfig.crowdfunding.abi,
      functionName: 'fund',
      value: amountWei,
    });
  };

  return {
    fundProject,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming
  };
}

// 提取资金的hook
export function useWithdrawFunds() {
  const { chain } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const contractConfig = useMemo(() => {
    if (!chain?.id) return null;
    try {
      return getContractConfig(chain.id);
    } catch {
      return null;
    }
  }, [chain?.id]);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdrawFunds = async (params: WithdrawParams) => {
    if (!contractConfig) {
      throw new Error('合约配置未找到，请检查网络连接');
    }

    writeContract({
      address: params.projectAddress as `0x${string}`,
      abi: contractConfig.crowdfunding.abi,
      functionName: 'withdrawMoney',
    });
  };

  return {
    withdrawFunds,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming
  };
}

// 获取用户在特定项目中的投资金额
export function useUserFundAmount(projectAddress: string) {
  const { address, chain } = useAccount();
  
  const contractConfig = useMemo(() => {
    if (!chain?.id) return null;
    try {
      return getContractConfig(chain.id);
    } catch {
      return null;
    }
  }, [chain?.id]);

  // 这里需要使用useReadContract来读取用户的投资金额
  // 注意：这需要合约中有相应的函数来查询用户投资金额
  // 如果合约中没有这个函数，可能需要通过事件日志来获取
  
  return {
    // 暂时返回空，需要根据实际合约接口实现
    userFundAmount: null,
    isLoading: false,
    error: null
  };
}