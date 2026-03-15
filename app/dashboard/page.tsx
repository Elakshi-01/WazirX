import { ProfileCard } from "../components/ProfileCard";
import { getServerSession } from "next-auth";
import db from "@/app/db";
import { authConfig } from "@/lib/auth";

async function getBalance() {
  const session = await getServerSession(authConfig);

  const userWallet = await db.solWallet.findFirst({
    where: {
      userId: session?.user?.uid,
    },
    select: {
      publicKey: true,
    },
  });

  if (!userWallet) {
    return {
      error: "No solana wallet found",
    };
  }

  return { error: null, userWallet };
}

export default async function Dashboard() {
  const userWallet = await getBalance();

  if (userWallet.error || !userWallet.userWallet?.publicKey) {
    return <>No solana wallet found</>;
  }

  return (
    <div>
      <ProfileCard publicKey={userWallet.userWallet?.publicKey} />
    </div>
  );
}