'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderNav } from '@/components/HeaderNav';
import { CreditScoreBadge } from '@/components/CreditScoreBadge';
import { UsdAmount } from '@/components/UsdAmount';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BorrowerHistory() {
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      return;
    }

    const load = async () => {
      try {
        const res = await fetch('/api/loans', { cache: 'no-store' });
        const all = await res.json();
        const mine = user ? all.filter((l: any) => l.borrowerId === (user.id || user._id)) : all;
        setLoans(mine);
      } catch (e) {
        setLoans([]);
      }
      setIsLoading(false);
    };
    load();
  }, [user, router]);

  const handleRepay = (loanId: string) => {
    const updatedLoans = loans.map(loan =>
      loan._id === loanId ? { ...loan, status: 'REPAID', repaidAt: new Date().toISOString() } : loan
    );
    setLoans(updatedLoans);

    if (user) {
      setUser({ ...user, creditScore: Math.min(user.creditScore + 20, 850) });
    }

    toast({
      title: 'Success',
      description: 'Loan repaid successfully! Your credit score has been updated.',
    });
  };

  const calculatePayoff = (loan: any) => {
    const interest = (loan.principalUsd * loan.aprBps * loan.tenureMonths) / (12 * 10000);
    return loan.principalUsd + interest;
  };

  const creditCategory = (score: number) => {
    if (score >= 750) return 'Excellent';
    if (score >= 650) return 'Good';
    if (score >= 550) return 'Fair';
    return 'Poor';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ACTIVE: 'default',
      REPAID: 'secondary',
      DEFAULTED: 'destructive',
      CANCELED: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (!user || user.role !== 'BORROWER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Loan History</h1>
          <p className="text-muted-foreground">
            Track your borrowing activity and credit score
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Credit Score</CardTitle>
          </CardHeader>
          <CardContent>
            <CreditScoreBadge score={user.creditScore} className="text-lg" />
            <p className="text-sm text-muted-foreground mt-2">
              Repay loans on time to improve your credit score
            </p>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No loans yet. Browse available pools to get started!
            </p>
            <Button className="mt-4" onClick={() => router.push('/app/borrower')}>
              Browse Pools
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Pool</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>APR</TableHead>
                    <TableHead>Tenure</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Collateral</TableHead>
                    <TableHead>Credit Score</TableHead>
                    <TableHead>Total Payoff</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan._id}>
                      <TableCell>
                        {new Date(loan.fundedAt || loan.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{loan.pool?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <UsdAmount amount={loan.principalUsd} />
                      </TableCell>
                      <TableCell>{(loan.aprBps / 100).toFixed(2)}%</TableCell>
                      <TableCell>{loan.tenureMonths} mo</TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{loan.collateral?.symbol || loan.collateral?.kind}: {loan.collateral?.amount}</div>
                          {loan.collateral?.link && (
                            <a className="text-primary underline" href={loan.collateral.link} target="_blank" rel="noreferrer">view proof</a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>Before: {loan.creditScoreBefore} ({creditCategory(loan.creditScoreBefore)})</div>
                          <div>After: {loan.creditScoreAfter} ({creditCategory(loan.creditScoreAfter)})</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <UsdAmount amount={calculatePayoff(loan)} />
                      </TableCell>
                      <TableCell>
                        {loan.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            onClick={() => handleRepay(loan._id)}
                          >
                            Repay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
