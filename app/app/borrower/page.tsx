'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/HeaderNav';
import { PoolCard } from '@/components/PoolCard';
import { useStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

const MOCK_POOLS = [
  {
    _id: 'pool-1',
    name: 'High-Yield HBAR Pool',
    description: 'Competitive rates for HBAR collateral loans',
    aprBps: 1200,
    tenureMonths: [3, 6, 12],
    allowedCollateralKinds: ['HBAR', 'TOKEN'],
    minLoanUsd: 100,
    maxLoanUsd: 10000,
    totalLiquidityUsd: 50000,
    totalBorrowedUsd: 15000,
    owner: { _id: 'lender-1', displayName: 'Demo Lender' },
  },
  {
    _id: 'pool-2',
    name: 'Premium Token Pool',
    description: 'Lower rates for quality HTS token collateral',
    aprBps: 900,
    tenureMonths: [6, 12],
    allowedCollateralKinds: ['TOKEN', 'RWA'],
    minLoanUsd: 500,
    maxLoanUsd: 25000,
    totalLiquidityUsd: 100000,
    totalBorrowedUsd: 30000,
    owner: { _id: 'lender-2', displayName: 'Premium Lender' },
  },
  {
    _id: 'pool-3',
    name: 'Flexible Short-Term Pool',
    description: 'Quick loans with flexible terms',
    aprBps: 1500,
    tenureMonths: [3, 6],
    allowedCollateralKinds: ['HBAR', 'TOKEN', 'RWA'],
    minLoanUsd: 50,
    maxLoanUsd: 5000,
    totalLiquidityUsd: 25000,
    totalBorrowedUsd: 8000,
    owner: { _id: 'lender-3', displayName: 'Quick Lender' },
  },
];

export default function BorrowerDashboard() {
  const [pools, setPools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!user.role) {
      router.push('/choose-role');
      return;
    }

    if (user.role !== 'BORROWER') {
      router.push('/app/lender');
      return;
    }

    const load = async () => {
      try {
        const res = await fetch('/api/pools', { cache: 'no-store' });
        const all = await res.json();
        setPools(all);
      } catch (e) {
        setPools([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user, router]);

  if (!user || user.role !== 'BORROWER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Available Lending Pools</h1>
          <p className="text-muted-foreground">
            Browse and borrow from lender-created pools
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : pools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No lending pools available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pools.map((pool) => (
              <PoolCard
                key={pool._id}
                pool={pool}
                actionLabel="Apply"
                actionHref={`/app/pool/${pool._id}/borrow`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
