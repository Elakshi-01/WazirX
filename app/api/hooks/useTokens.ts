import axios from "axios";
import { useEffect, useState, useCallback } from "react";

export interface TokenDetails {
  name: string;
  mint: string;
  native: boolean;
  price: number;
  image: string;
}

export interface TokenWithBalance extends TokenDetails {
  balance: number;
  usdBalance: number;
}

export function useTokens(address: string) {
  const [tokenBalances, setTokenBalances] = useState<{
    totalBalance: number;
    tokens: TokenWithBalance[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTokens = useCallback(() => {
    if (!address) return;
    setLoading(true);
    axios
      .get(`/api/tokens?address=${address}&t=${Date.now()}`)
      .then((res) => {
        setTokenBalances(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch tokens:", err);
        setLoading(false);
      });
  }, [address]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return {
    loading,
    tokenBalances,
    refresh: fetchTokens,
  };
}