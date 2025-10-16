'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function HeaderNav() {
  const { user, logout } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  const getDashboardLink = () => {
    if (user.role === 'BORROWER') return '/app/borrower';
    if (user.role === 'LENDER') return '/app/lender';
    return '/choose-role';
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={getDashboardLink()} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            <span className="text-xl font-bold">CredOra</span>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          {user.role && (
            <Link href={getDashboardLink()}>
              <Button variant="ghost">Dashboard</Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                {user.email || user.walletAddress?.slice(0, 8) + '...'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    {user.email || user.walletAddress}
                  </span>
                  {user.role && (
                    <Badge variant="secondary" className="w-fit text-xs">
                      {user.role}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user.role === 'BORROWER' && (
                <>
                  <DropdownMenuItem onClick={() => router.push('/app/borrower')}>
                    Browse Pools
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/app/borrower/history')}>
                    Loan History
                  </DropdownMenuItem>
                </>
              )}
              {user.role === 'LENDER' && (
                <>
                  <DropdownMenuItem onClick={() => router.push('/app/lender')}>
                    My Pools
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/app/lender/create-pool')}>
                    Create Pool
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
