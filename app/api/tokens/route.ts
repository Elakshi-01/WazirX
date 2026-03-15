import { NextRequest, NextResponse } from "next/server";
import { getAccount, getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { connection, getSupportedTokens } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address') as string;

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  const supportedTokens = await getSupportedTokens();

  const balances = await Promise.all(
    supportedTokens.map(token => getAccountBalance(token, address))
  );

  const tokens = supportedTokens.map((token, index) => ({
    ...token,
    balance: balances[index].toFixed(2),
    usdBalance: (balances[index] * Number(token.price)).toFixed(2),
  }));

  return NextResponse.json({
    tokens,
    totalBalance: tokens.reduce((acc, val) => acc + Number(val.usdBalance), 0).toFixed(2),
  });
}

async function getAccountBalance(
  token: {
    name: string;
    mint: string;
    native: boolean;
  },
  address: string
): Promise<number> {
  try {
    if (token.native) {
      const balance = await connection.getBalance(new PublicKey(address));
      return balance / LAMPORTS_PER_SOL;
    }

    const ata = await getAssociatedTokenAddress(
      new PublicKey(token.mint),
      new PublicKey(address)
    );

    const account = await getAccount(connection, ata);
    const mint = await getMint(connection, new PublicKey(token.mint));

    return Number(account.amount) / (10 ** mint.decimals);
  } catch (e) {
    return 0;
  }
}