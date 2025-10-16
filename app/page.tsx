import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-12 h-12" />
            <h1 className="text-5xl font-bold">CredOra</h1>
          </div>

          <h2 className="text-3xl font-semibold text-muted-foreground">
            Hedera P2P Lending Marketplace
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl">
          Access instant collateralized loans and build your own lending pools — all with transparent on-chain credit profiling.
          </p>

          <div className="flex gap-4 mt-8">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16 w-full">
            <div className="flex flex-col items-center p-6 rounded-lg border bg-card">
              <TrendingUp className="w-10 h-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Unlock Liquidity</h3>
              <p className="text-muted-foreground text-center">
              Access instant, collateralized loans without selling your assets. 
              </p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-lg border bg-card">
              <Shield className="w-10 h-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Custom Lending Pools
              </h3>
              <p className="text-muted-foreground text-center">
              Create and manage your own lending pools with flexible terms.
              </p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-lg border bg-card">
              <Zap className="w-10 h-10 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2"> On-Chain Credit Identity
              </h3>
              <p className="text-muted-foreground text-center">
              Leverage verifiable, on-chain credit profiles and compliant identity verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
