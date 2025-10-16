import { AuthTabs } from '@/components/AuthTabs';
import { Wallet } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <Wallet className="w-8 h-8" />
            <span className="text-2xl font-bold">CredOra</span>
          </Link>
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="text-muted-foreground mt-2">
            Login or create an account to get started
          </p>
        </div>

        <AuthTabs />
      </div>
    </div>
  );
}
