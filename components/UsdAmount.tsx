interface UsdAmountProps {
  amount: number;
  className?: string;
}

export function UsdAmount({ amount, className = '' }: UsdAmountProps) {
  const decimals = 2;
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <span className={className}>${formatted}</span>;
}
