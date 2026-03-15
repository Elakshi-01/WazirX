"use client"
import { TokenWithBalance } from "../api/hooks/useTokens";

export function TokenList({ tokens }: {
    tokens: TokenWithBalance[]
}) {
    return <div>
        {tokens.map(t => <TokenRow key={t.name} token={t} />)}
    </div>
}

function TokenRow({ token }: {
    token: TokenWithBalance
}) {
    return <div className="flex justify-between py-2">
        <div className="flex">
            <img src={token.image} className="h-10 w-10 rounded-full mr-2" />
            <div>
                <div className="font-bold">{token.name}</div>
                <div className="text-slate-500 text-sm">1 {token.name} = ~${token.price}</div>
            </div>
        </div>
        <div>
            <div className="font-bold flex justify-end">${token.usdBalance}</div>
            <div className="text-slate-500 text-sm flex justify-end">{token.balance} {token.name}</div>
        </div>
    </div>
}