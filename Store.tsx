import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type PoolStats = {
  currentPrice: string;
  marketCap: string;
  totalHbarRaised: string;
  tokensRemaining: string;
  isGraduated: boolean;
  progressToGraduation: string;
  priceInUSD: string;
};

type AppState = {
  tokenAddress: string;
  poolAddress: string;
  poolStats: PoolStats | null;
  tokenInfo: AppTokenInfo | null;
  setTokenInfo: (info: AppTokenInfo | null) => void;
  setTokenAddress: (addr: string) => void;
  setPoolAddress: (addr: string) => void;
  setPoolStats: (stats: PoolStats | null) => void;
};
type AppTokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  totalSupplyRaw: string;
  ownerBalance: string;
  contractBalance: string;
  contractAddress: string;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tokenAddress: '',
      poolAddress: '',
      poolStats: null,
      tokenInfo: null,
      setTokenInfo: (info) => set({ tokenInfo: info }),
      setTokenAddress: (addr) => set({ tokenAddress: addr }),
      setPoolAddress: (addr) => set({ poolAddress: addr }),
      setPoolStats: (stats) => set({ poolStats: stats }),
    }),
    {
      name: 'app-storage', // key in localStorage
      partialize: (state) => ({
        tokenInfo: state.tokenInfo,
        tokenAddress: state.tokenAddress,
        poolAddress: state.poolAddress,
        poolStats: state.poolStats,
      }),
    }
  )
);
