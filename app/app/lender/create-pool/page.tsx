'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/HeaderNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const TENURE_OPTIONS = [3, 6, 9, 12];
const COLLATERAL_KINDS = [
  { value: 'HBAR', label: 'HBAR' },
  { value: 'TOKEN', label: 'HTS Tokens' },
  { value: 'RWA', label: 'RWA Assets' },
];

export default function CreatePoolPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    aprBps: '',
    ltvBps: '6000',
    tenureMonths: [3, 6, 12] as number[],
    allowedCollateralKinds: ['HBAR', 'TOKEN', 'RWA'] as string[],
    allowedSymbols: '',
    minLoanUsd: '100',
    maxLoanUsd: '10000',
    totalLiquidityUsd: '',
  });

  const { user, setUser } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'LENDER') {
      router.push('/app/borrower');
    }
  }, [user, router]);

  const handleTenureToggle = (months: number) => {
    setFormData((prev) => ({
      ...prev,
      tenureMonths: prev.tenureMonths.includes(months)
        ? prev.tenureMonths.filter((m) => m !== months)
        : [...prev.tenureMonths, months].sort((a, b) => a - b),
    }));
  };

  const handleCollateralToggle = (kind: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedCollateralKinds: prev.allowedCollateralKinds.includes(kind)
        ? prev.allowedCollateralKinds.filter((k) => k !== kind)
        : [...prev.allowedCollateralKinds, kind],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (formData.tenureMonths.length === 0) {
        throw new Error('Please select at least one tenure option');
      }

      if (formData.allowedCollateralKinds.length === 0) {
        throw new Error('Please select at least one collateral type');
      }

      const aprBps = Number(formData.aprBps);
      if (aprBps <= 0 || aprBps > 10000) {
        throw new Error('APR must be between 0% and 100%');
      }

      const ltvBps = Number(formData.ltvBps);
      if (ltvBps <= 0 || ltvBps > 10000) {
        throw new Error('Max LTV must be between 0% and 100%');
      }

      const minLoan = Number(formData.minLoanUsd);
      const maxLoan = Number(formData.maxLoanUsd);
      if (minLoan >= maxLoan) {
        throw new Error('Max loan must be greater than min loan');
      }

      const liquidity = Number(formData.totalLiquidityUsd);
      if (liquidity <= 0) {
        throw new Error('Liquidity must be greater than 0');
      }

      const symbols = formData.allowedSymbols
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await fetch('/api/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          aprBps,
          ltvBps,
          minLoanUsd: minLoan,
          maxLoanUsd: maxLoan,
          totalLiquidityUsd: liquidity,
          allowedSymbols: symbols,
          owner: user ? { _id: user.id || user._id, displayName: user.displayName || user.email } : undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create pool');

      toast({
        title: 'Success',
        description: 'Lending pool created successfully!',
      });

      router.push('/app/lender');
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

  if (!user || user.role !== 'LENDER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link href="/app/lender">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Create Lending Pool</h1>
            <p className="text-muted-foreground">
              Set up a new lending pool with your terms and conditions
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pool Details</CardTitle>
              <CardDescription>
                Configure your lending pool parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Pool Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., High-Yield HBAR Pool"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your lending pool..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apr">Annual Interest Rate (APR %)</Label>
                    <Input
                      id="apr"
                      type="number"
                      placeholder="e.g., 12.00"
                      value={formData.aprBps ? (Number(formData.aprBps) / 100).toString() : ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          aprBps: (Number(e.target.value) * 100).toString(),
                        }))
                      }
                      step="0.01"
                      min="0"
                      max="100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ltv">Max LTV (%)</Label>
                    <Input
                      id="ltv"
                      type="number"
                      placeholder="e.g., 60"
                      value={formData.ltvBps ? (Number(formData.ltvBps) / 100).toString() : ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          ltvBps: (Number(e.target.value) * 100).toString(),
                        }))
                      }
                      step="1"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="liquidity">Initial Liquidity (USDC)</Label>
                    <Input
                      id="liquidity"
                      type="number"
                      placeholder="e.g., 50000"
                      value={formData.totalLiquidityUsd}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          totalLiquidityUsd: e.target.value,
                        }))
                      }
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minLoan">Min Loan Amount (USDC)</Label>
                    <Input
                      id="minLoan"
                      type="number"
                      value={formData.minLoanUsd}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, minLoanUsd: e.target.value }))
                      }
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLoan">Max Loan Amount (USDC)</Label>
                    <Input
                      id="maxLoan"
                      type="number"
                      value={formData.maxLoanUsd}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, maxLoanUsd: e.target.value }))
                      }
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Loan Tenure Options</Label>
                  <div className="flex flex-wrap gap-4">
                    {TENURE_OPTIONS.map((months) => (
                      <div key={months} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tenure-${months}`}
                          checked={formData.tenureMonths.includes(months)}
                          onCheckedChange={() => handleTenureToggle(months)}
                        />
                        <Label
                          htmlFor={`tenure-${months}`}
                          className="cursor-pointer"
                        >
                          {months} months
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Allowed Collateral Types</Label>
                  <div className="flex flex-wrap gap-4">
                    {COLLATERAL_KINDS.map((kind) => (
                      <div key={kind.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`collateral-${kind.value}`}
                          checked={formData.allowedCollateralKinds.includes(kind.value)}
                          onCheckedChange={() => handleCollateralToggle(kind.value)}
                        />
                        <Label
                          htmlFor={`collateral-${kind.value}`}
                          className="cursor-pointer"
                        >
                          {kind.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symbols">
                    Allowed Token Symbols (optional)
                  </Label>
                  <Input
                    id="symbols"
                    placeholder="e.g., HBAR, JAM, USDC (comma-separated)"
                    value={formData.allowedSymbols}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        allowedSymbols: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to allow all tokens of the selected types
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Lending Pool
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
