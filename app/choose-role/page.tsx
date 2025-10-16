'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/lib/store';
import { Wallet, TrendingUp, HandCoins, Loader2 } from 'lucide-react';

export default function ChooseRolePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'BORROWER' | 'LENDER' | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user, setUser } = useStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role) {
      router.push(user.role === 'BORROWER' ? '/app/borrower' : '/app/lender');
    }
  }, [user, router]);

  const handleSelectRole = (role: 'BORROWER' | 'LENDER') => {
    setSelectedRole(role);
    setIsLoading(true);

    try {
      if (user) {
        setUser({ ...user, role });
      }
      router.push(role === 'BORROWER' ? '/app/borrower' : '/app/lender');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  if (!user || user.role) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wallet className="w-8 h-8" />
            <span className="text-2xl font-bold">CredOra</span>
          </div>
          <h1 className="text-3xl font-bold">Choose Your Role</h1>
          <p className="text-muted-foreground mt-2">
            Select how you want to participate in the marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <HandCoins className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl">Borrower</CardTitle>
              </div>
              <CardDescription className="text-base">
                Get access to loans by providing crypto collateral
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Browse lending pools with competitive rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Secure loans with HBAR, HTS tokens, or RWA</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Build your credit score through timely repayments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Flexible loan terms from 3 to 12 months</span>
                </li>
              </ul>
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleSelectRole('BORROWER')}
                disabled={isLoading}
              >
                {isLoading && selectedRole === 'BORROWER' && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Continue as Borrower
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl">Lender</CardTitle>
              </div>
              <CardDescription className="text-base">
                Create lending pools and earn returns on your USDC
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Set your own interest rates and terms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Choose which collateral types to accept</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Compete with other lenders for borrowers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Track pool utilization and performance</span>
                </li>
              </ul>
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleSelectRole('LENDER')}
                disabled={isLoading}
              >
                {isLoading && selectedRole === 'LENDER' && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Continue as Lender
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
