'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { HeaderNav } from '@/components/HeaderNav';
import { UsdAmount } from '@/components/UsdAmount';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Info, TrendingUp, Calendar, Coins, Shield } from 'lucide-react';

const COLLATERAL_OPTIONS = [
  { kind: 'HBAR', symbol: 'HBAR', label: 'HBAR' },
  { kind: 'TOKEN', symbol: 'JAM', label: 'JAM Token' },
  { kind: 'TOKEN', symbol: 'USDC', label: 'USDC' },
  { kind: 'RWA', symbol: 'GOLD1', label: 'Gold Token' },
];

export default function BorrowPage() {
  const params = useParams();
  const poolId = params.id as string;
  const [pool, setPool] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [principalUsd, setPrincipalUsd] = useState('');
  const [tenureMonths, setTenureMonths] = useState('');
  const [collateralType, setCollateralType] = useState('');
  const [collateralLink, setCollateralLink] = useState('');

  const { user, setUser } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'BORROWER') {
      router.push('/app/lender');
    }
  }, [user, router]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/pools', { cache: 'no-store' });
        const all = await res.json();
        const found = all.find((p: any) => p._id === poolId);
        setPool(found);
      } catch (e) {
        setPool(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [poolId]);

  const ltvPercent = pool?.ltvBps
    ? pool.ltvBps / 100
    : typeof (pool as any)?.ltvPercent === 'number'
      ? (pool as any).ltvPercent
      : 60;

  const selectedCollateral = COLLATERAL_OPTIONS.find(opt => opt.label === collateralType);
  const mockPrices: Record<string, number> = {
    HBAR: 0.1,
    JAM: 0.02,
    USDC: 1.0,
    GOLD1: 70.0,
  };
  const selectedPrice = selectedCollateral ? (mockPrices[selectedCollateral.symbol] || 1.0) : 0;
  const requiredCollateralUsd = principalUsd ? Number(principalUsd) / (ltvPercent / 100) : 0;
  const requiredCollateralUnits = selectedPrice > 0 ? requiredCollateralUsd / selectedPrice : 0;

  const calculateInterest = () => {
    if (!principalUsd || !tenureMonths || !pool) return 0;
    return (Number(principalUsd) * pool.aprBps * Number(tenureMonths)) / (12 * 10000);
  };

  const calculateMaturityDate = () => {
    if (!tenureMonths) return null;
    const date = new Date();
    date.setMonth(date.getMonth() + Number(tenureMonths));
    return date.toLocaleDateString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const principal = Number(principalUsd);
      if (principal < pool.minLoanUsd || principal > pool.maxLoanUsd) {
        throw new Error(`Loan amount must be between $${pool.minLoanUsd} and $${pool.maxLoanUsd}`);
      }

      const remainingLiquidity = pool.totalLiquidityUsd - pool.totalBorrowedUsd;
      if (principal > remainingLiquidity) {
        throw new Error('Insufficient liquidity in pool');
      }

      const selected = COLLATERAL_OPTIONS.find(opt => opt.label === collateralType);
      if (!selected) {
        throw new Error('Please select collateral type');
      }

      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId: pool._id,
          borrowerId: user?.id || user?._id || 'demo-user',
          principalUsd: principal,
          aprBps: pool.aprBps,
          tenureMonths: Number(tenureMonths),
          status: 'ACTIVE',
          collateral: {
            kind: selected.kind,
            symbol: selected.symbol,
            amount: requiredCollateralUnits,
            requiredUsd: requiredCollateralUsd,
            link: collateralLink,
          },
          creditScoreBefore: user?.creditScore,
          creditScoreAfter: user?.creditScore,
          fundedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Failed to create loan');

      toast({
        title: 'Success',
        description: 'Loan created successfully!',
      });

      router.push('/app/borrower/history');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'BORROWER' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderNav />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Pool not found</p>
        </main>
      </div>
    );
  }

  const interest = calculateInterest();
  const totalPayoff = Number(principalUsd || 0) + interest;
  const maturityDate = calculateMaturityDate();

  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Borrow from {pool.name}</h1>
            <p className="text-muted-foreground">{pool.description}</p>
          </div>

          <Alert className="mb-6">
            <Info className="w-4 h-4" />
            <AlertDescription>
              USD values are estimates based on current market prices. No auto-liquidations in MVP.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pool Terms</CardTitle>
                <CardDescription>Review the lending pool details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <Badge variant="secondary" className="text-base">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {(pool.aprBps / 100).toFixed(2)}% APR
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Max LTV</span>
                  <Badge variant="secondary" className="text-base">
                    <Shield className="w-4 h-4 mr-1" />
                    {ltvPercent.toFixed(0)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Loan Range</span>
                  <span className="font-medium">
                    <UsdAmount amount={pool.minLoanUsd} /> - <UsdAmount amount={pool.maxLoanUsd} />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Available Liquidity</span>
                  <span className="font-medium">
                    <UsdAmount amount={pool.totalLiquidityUsd - pool.totalBorrowedUsd} />
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-2">Available Tenures</span>
                  <div className="flex gap-2 flex-wrap">
                    {pool.tenureMonths.map((months: number) => (
                      <Badge key={months} variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {months} months
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-2">Accepted Collateral</span>
                  <div className="flex gap-2 flex-wrap">
                    {pool.allowedCollateralKinds.map((kind: string) => (
                      <Badge key={kind} variant="secondary">
                        {kind}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loan Application</CardTitle>
                <CardDescription>Enter your loan details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="principal">Loan Amount (USDC)</Label>
                    <Input
                      id="principal"
                      type="number"
                      placeholder="Enter amount"
                      value={principalUsd}
                      onChange={(e) => setPrincipalUsd(e.target.value)}
                      min={pool.minLoanUsd}
                      max={pool.maxLoanUsd}
                      step="0.01"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Min: ${pool.minLoanUsd} - Max: ${pool.maxLoanUsd}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tenure">Tenure</Label>
                    <Select value={tenureMonths} onValueChange={setTenureMonths} required>
                      <SelectTrigger id="tenure">
                        <SelectValue placeholder="Select tenure" />
                      </SelectTrigger>
                      <SelectContent>
                        {pool.tenureMonths.map((months: number) => (
                          <SelectItem key={months} value={months.toString()}>
                            {months} months
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collateralType">Collateral Type</Label>
                    <Select value={collateralType} onValueChange={setCollateralType} required>
                      <SelectTrigger id="collateralType">
                        <SelectValue placeholder="Select collateral" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLLATERAL_OPTIONS.map((opt) => (
                          <SelectItem key={opt.label} value={opt.label}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="collateralLink">Submit Collateral Link</Label>
                    <Input
                      id="collateralLink"
                      type="url"
                      placeholder="Paste transaction/proof link"
                      value={collateralLink}
                      onChange={(e) => setCollateralLink(e.target.value)}
                      required
                    />
                    {principalUsd && collateralType && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        Required Collateral: ~{requiredCollateralUnits.toFixed(4)} {selectedCollateral?.symbol}
                        <span className="opacity-70">(≈ <UsdAmount amount={requiredCollateralUsd} />)</span>
                      </p>
                    )}
                  </div>

                  {principalUsd && tenureMonths && (
                    <Card className="bg-muted">
                      <CardContent className="pt-6 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Principal</span>
                          <span className="font-medium">
                            <UsdAmount amount={Number(principalUsd)} />
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Interest</span>
                          <span className="font-medium">
                            <UsdAmount amount={interest} />
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Total Payoff</span>
                          <span>
                            <UsdAmount amount={totalPayoff} />
                          </span>
                        </div>
                        {maturityDate && (
                          <div className="flex justify-between text-sm pt-2">
                            <span className="text-muted-foreground">Maturity Date</span>
                            <span className="font-medium">{maturityDate}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit Loan Application
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
