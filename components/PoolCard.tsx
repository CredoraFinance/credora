'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from './ProgressBar';
import { UsdAmount } from './UsdAmount';
import { Coins, TrendingUp, Calendar, Wallet, Shield } from 'lucide-react';

interface PoolCardProps {
  pool: any;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function PoolCard({ pool, actionLabel = 'View Details', actionHref, onAction }: PoolCardProps) {
  const aprPercent = (pool.aprBps / 100).toFixed(2);
  const ltvPercent = typeof pool.ltvBps === 'number'
    ? (pool.ltvBps / 100).toFixed(0)
    : typeof pool.ltvPercent === 'number'
      ? pool.ltvPercent.toFixed(0)
      : '60';

  return (
    <Card className="hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-xl">{pool.name}</h3>
                {pool.description && (
                  <p className="text-sm text-muted-foreground mt-1">{pool.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Interest Rate</p>
              <p className="font-semibold text-lg">{aprPercent}% APR</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Max LTV</p>
              <p className="font-semibold text-lg">{ltvPercent}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Loan Range</p>
              <p className="font-medium text-sm">
                <UsdAmount amount={pool.minLoanUsd} /> - <UsdAmount amount={pool.maxLoanUsd} />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Tenure</p>
              <div className="flex gap-1">
                {pool.tenureMonths.map((t: number) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}mo
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Collateral</p>
              <div className="flex gap-1">
                {pool.allowedCollateralKinds.map((kind: string) => (
                  <Badge key={kind} variant="secondary" className="text-xs">
                    {kind}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-[200px] flex-1">
            <ProgressBar
              current={pool.totalBorrowedUsd}
              total={pool.totalLiquidityUsd}
              label="Liquidity"
            />
          </div>

          <div>
            {onAction ? (
              <Button onClick={onAction} size="lg">
                {actionLabel}
              </Button>
            ) : actionHref ? (
              <Link href={actionHref}>
                <Button size="lg">{actionLabel}</Button>
              </Link>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
