import { memo, type ReactNode } from 'react';
import { useSkeleton } from './useSkeleton';
import styles from './Skeleton.module.scss';

interface SkeletonWrapperProps {
  loading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  options?: {
    minDisplayMs?: number;
    delayMs?: number | null;
  };
}

const SkeletonWrapper = memo(({
  loading,
  skeleton,
  children,
  options,
}: SkeletonWrapperProps) => {
  const { show } = useSkeleton(loading, options);

  if (show) {
    return (
      <div className={styles.wrapper} aria-busy="true" role="status">
        <div className={styles.wrapperSkeleton}>{skeleton}</div>
        <div className={styles.wrapperContentStatic} aria-hidden="true">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.wrapperContentVisible}>
        {children}
      </div>
    </div>
  );
});

SkeletonWrapper.displayName = 'SkeletonWrapper';

export default SkeletonWrapper;
