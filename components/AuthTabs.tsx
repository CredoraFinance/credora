'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/lib/store';
import { Mail, Wallet, Loader2, Info, User } from 'lucide-react';

const DEMO_CREDENTIALS = {
  borrower: { email: 'borrower@demo.com', password: 'demo123' },
  lender: { email: 'lender@demo.com', password: 'demo123' },
};

export function AuthTabs() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useStore();

  const handleDemoLogin = async (role: 'borrower' | 'lender') => {
    const creds = DEMO_CREDENTIALS[role];
    setEmail(creds.email);
    setPassword(creds.password);
    setIsLoading(true);

    try {
      const mockUser = {
        _id: `demo-${role}-id`,
        id: `demo-${role}-id`,
        email: creds.email,
        role: role.toUpperCase() as 'BORROWER' | 'LENDER',
        displayName: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        creditScore: role === 'borrower' ? 720 : 600,
      };

      setUser(mockUser);
      router.push(role === 'borrower' ? '/app/borrower' : '/app/lender');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const mockUser = {
        _id: `user-${Math.random().toString(36).substring(7)}`,
        id: `user-${Math.random().toString(36).substring(7)}`,
        email,
        creditScore: 600,
      };

      setUser(mockUser);
      router.push('/choose-role');

      toast({
        title: 'Success',
        description: isLogin ? 'Logged in successfully!' : 'Account created successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async (type: 'hashpack' | 'blade' | 'demo') => {
    setIsLoading(true);

    try {
      if (type !== 'demo') {
        toast({
          title: 'Coming Soon',
          description: `${type === 'hashpack' ? 'HashPack' : 'Blade'} integration is under development`,
        });
        setIsLoading(false);
        return;
      }

      const address = 'demo_' + Math.random().toString(36).substring(7);
      const mockUser = {
        _id: `wallet-${address}`,
        id: `wallet-${address}`,
        walletAddress: address,
        creditScore: 600,
      };

      setUser(mockUser);
      router.push('/choose-role');

      toast({
        title: 'Success',
        description: 'Wallet connected successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="email" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="email">
          <Mail className="w-4 h-4 mr-2" />
          Email
        </TabsTrigger>
        <TabsTrigger value="wallet">
          <Wallet className="w-4 h-4 mr-2" />
          Wallet
        </TabsTrigger>
      </TabsList>

      <TabsContent value="email">
        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'Login' : 'Register'}</CardTitle>
            <CardDescription>
              {isLogin
                ? 'Enter your email and password to login'
                : 'Create a new account with email and password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Info className="w-4 h-4" />
              <AlertDescription>
                <div className="text-sm space-y-2">
                  <p className="font-semibold">Demo Credentials (No DB Required):</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Borrower</Badge>
                      <span className="text-xs">borrower@demo.com / demo123</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Lender</Badge>
                      <span className="text-xs">lender@demo.com / demo123</span>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('borrower')}
                disabled={isLoading}
              >
                <User className="w-3 h-3 mr-1" />
                Demo Borrower
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('lender')}
                disabled={isLoading}
              >
                <User className="w-3 h-3 mr-1" />
                Demo Lender
              </Button>
            </div>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or use your account</span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLogin ? 'Login' : 'Register'}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setIsLogin(!isLogin)}
                disabled={isLoading}
              >
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="wallet">
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Connect your Hedera wallet to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleWalletConnect('hashpack')}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              HashPack
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleWalletConnect('blade')}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Blade
            </Button>
            {process.env.NEXT_PUBLIC_ENABLE_DEMO_WALLET === 'true' && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleWalletConnect('demo')}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Demo Wallet
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
