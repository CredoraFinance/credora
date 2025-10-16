import { Badge } from '@/components/ui/badge';

interface CreditScoreBadgeProps {
  score: number;
  className?: string;
}

export function CreditScoreBadge({ score, className = '' }: CreditScoreBadgeProps) {
  const getVariant = () => {
    if (score >= 750) return 'default';
    if (score >= 650) return 'secondary';
    return 'destructive';
  };

  const getLabel = () => {
    if (score >= 750) return 'Excellent';
    if (score >= 650) return 'Good';
    if (score >= 550) return 'Fair';
    return 'Poor';
  };

  return (
    <Badge variant={getVariant()} className={className}>
      {score} - {getLabel()}
    </Badge>
  );
}
