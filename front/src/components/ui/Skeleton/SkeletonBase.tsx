import { memo } from 'react';
import styles from './Skeleton.module.scss';

export interface SkeletonBaseProps {
  variant?: 'text' | 'circle' | 'rect' | 'custom';
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
  count?: number;
  gap?: string | number;
  inline?: boolean;
  shimmer?: boolean;
  /** Staggered animation delay index */
  index?: number;
}

const SkeletonBase = memo(({
  variant = 'rect',
  width,
  height,
  borderRadius,
  className = '',
  style,
  count = 1,
  gap = 8,
  inline = false,
  shimmer = true,
  index = 0,
}: SkeletonBaseProps) => {
  const baseStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: borderRadius !== undefined
      ? (typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius)
      : variant === 'circle' ? '50%'
      : variant === 'text' ? '4px'
      : '8px',
    display: inline ? 'inline-block' : 'block',
    marginBottom: count > 1 ? (typeof gap === 'number' ? `${gap}px` : gap) : undefined,
    '--skeleton-index': index,
    ...style,
  } as React.CSSProperties;

  const cls = [
    styles.skeleton,
    styles[variant] || styles.rect,
    shimmer ? styles.shimmer : styles.pulse,
    className,
  ].filter(Boolean).join(' ');

  if (count <= 1) {
    return <div className={cls} style={baseStyle} aria-hidden="true" />;
  }

  return (
    <div aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cls}
          style={{
            ...baseStyle,
            '--skeleton-index': index + i,
            marginBottom: i < count - 1 ? (typeof gap === 'number' ? `${gap}px` : gap) : 0,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
});

SkeletonBase.displayName = 'SkeletonBase';

export default SkeletonBase;
