'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeaderNav } from '@/components/HeaderNav';
import { PoolCard } from '@/components/PoolCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/lib/store';
import { Loader2, Plus } from 'lucide-react';

export default function LenderDashboard() {
  const [myPools, setMyPools] = useState<any[]>([]);
  const [otherPools, setOtherPools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useStore();
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

    if (user.role !== 'LENDER') {
      router.push('/app/borrower');
      return;
    }

    const load = async () => {
      try {
        const res = await fetch('/api/pools', { cache: 'no-store' });
        const all = await res.json();
        setOtherPools(all);
        setMyPools(user ? all.filter((p: any) => p.owner?._id === (user.id || user._id)) : []);
      } catch (e) {
        setOtherPools([]);
        setMyPools([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user, router]);

  if (!user || user.role !== 'LENDER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lender Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your lending pools and track performance
            </p>
          </div>
          <Link href="/app/lender/create-pool">
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Pool
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="my-pools" className="space-y-6">
            <TabsList>
              <TabsTrigger value="my-pools">
                My Pools ({myPools.length})
              </TabsTrigger>
              <TabsTrigger value="marketplace">
                Marketplace ({otherPools.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-pools" className="space-y-6">
              {myPools.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                  <p className="text-muted-foreground text-lg mb-4">
                    You haven't created any lending pools yet
                  </p>
                  <Link href="/app/lender/create-pool">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Pool
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myPools.map((pool) => (
                    <PoolCard
                      key={pool._id}
                      pool={pool}
                      actionLabel="Manage"
                      actionHref={`/app/lender/pool/${pool._id}`}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="marketplace" className="space-y-6">
              {otherPools.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No other lending pools available yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {otherPools.map((pool) => (
                    <PoolCard
                      key={pool._id}
                      pool={pool}
                      actionLabel="View Details"
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
