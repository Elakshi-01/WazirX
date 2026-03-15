import axios from "axios";
import { Connection } from "@solana/web3.js";

let LAST_UPDATED: number | null = null;
let prices: Record<string, any> = {};

const TOKEN_PRICE_REFRESH_INTERVAL = 60 * 1000;

export interface TokenDetails {
  name: string;
  mint: string;
  native: boolean;
  price: string;
  image: string;
  decimals: number;
}

export const SUPPORTED_TOKENS: TokenDetails[] = [
  {
    name: "SOL",
    mint: "So11111111111111111111111111111111111111112",
    native: true,
    price: "180",
    image: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
    decimals: 9,
  },
  {
    name: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    native: false,
    price: "1",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ43MuDqq54iD1ZCRL_uthAPkfwSSL-J5qI_Q&s",
    decimals: 6,
  },
  {
    name: "USDT",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    native: false,
    price: "1",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGjzLfKoUMPlj3m9LMzSEi4J1h_n8HDFOVvw&s",
    decimals: 6,
  },
];

export const connection = new Connection("https://api.devnet.solana.com");

export async function getSupportedTokens() {
  if (
    !LAST_UPDATED ||
    new Date().getTime() - LAST_UPDATED > TOKEN_PRICE_REFRESH_INTERVAL
  ) {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin,tether&vs_currencies=usd"
      );
      const data = response.data;
      prices = {
        SOL: { price: data["solana"]?.usd || 180 },
        USDC: { price: data["usd-coin"]?.usd || 1 },
        USDT: { price: data["tether"]?.usd || 1 },
      };
      LAST_UPDATED = new Date().getTime();
    } catch (e) {
      prices = {
        SOL: { price: 180 },
        USDC: { price: 1 },
        USDT: { price: 1 },
      };
    }
  }

  return SUPPORTED_TOKENS.map((token) => ({
    ...token,
    price: prices[token.name]?.price || 0,
  }));
}