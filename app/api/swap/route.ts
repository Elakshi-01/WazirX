import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";

export async function POST(req: NextRequest) {
    const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=5935eb6e-9c4e-4031-b4b6-f1290106d2d6")
    const data: {
        quoteResponse: any
    } = await req.json();

    const session = await getServerSession(authConfig);
    console.log(session)
    if (!session?.user) {
        return NextResponse.json({
            message: "You are not logged in"
        }, {
            status: 401
        })
    }

    const solWallet = await db.solWallet.findFirst({
        where: {
            userId: session.user.uid
        }
    })

    if (!solWallet) {
        return NextResponse.json({
            message: "Couldnt find associated solana wallet"
        }, {
            status: 401
        })
    }

    const { swapTransaction } = await (
        await fetch('https://api.jup.ag/swap/v1/swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_JUPITER_API_KEY || ''
          },
          body: JSON.stringify({
            quoteResponse: data.quoteResponse,
            userPublicKey: solWallet.publicKey,
            wrapAndUnwrapSol: true,
          })
        })
      ).json();

      console.log("Jup returned txn")

      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      const privateKey = getPrivateKeyFromDb(solWallet.privateKey)
      transaction.sign([privateKey]);

      const latestBlockHash = await connection.getLatestBlockhash('finalized');

      const rawTransaction = transaction.serialize()
      const txid = await connection.sendRawTransaction(rawTransaction, {
          skipPreflight: true,
          maxRetries: 2
      });

      console.log("Transaction sent:", txid);

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txid
      }, 'confirmed');

      return NextResponse.json({
        txid
    })
}

function getPrivateKeyFromDb(privateKey: string) {
    const privateKeyUintArr = Uint8Array.from(Buffer.from(privateKey, 'base64'));
    const keypair = Keypair.fromSecretKey(privateKeyUintArr);
    return keypair;
}