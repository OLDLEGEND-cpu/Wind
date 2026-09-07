import clsx from 'clsx';

interface AvatarProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ name, color = '#6366f1', size = 'md' }: AvatarProps) {
  const initial = name?.trim()?.[0]?.toUpperCase() || '?';
  const sizeClass = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-14 w-14 text-lg' }[size];

  return (
    <div
      className={clsx('flex items-center justify-center rounded-full font-semibold text-white shrink-0', sizeClass)}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );
}
