import { cn } from '../../services/cn';

export function Skeleton({ className, ...rest }) {
  return <div className={cn('skeleton', className)} {...rest} />;
}
