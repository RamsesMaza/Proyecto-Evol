import { memo } from 'react';
import SkeletonBase from './SkeletonBase';
import {
  SkeletonDashboard,
  SkeletonProductDetail,
  SkeletonForm,
  SkeletonBlogGrid,
  SkeletonBlogPost,
  SkeletonTextBlock,
} from './composites';
import styles from './Skeleton.module.scss';

export type PageSkeletonVariant =
  | 'home'
  | 'nosotros'
  | 'servicios'
  | 'blog'
  | 'blogPost'
  | 'contacto'
  | 'login'
  | 'producto'
  | 'checkout'
  | 'panel'
  | 'solicitudes'
  | 'verify'
  | 'default';

interface PageSkeletonProps {
  variant?: PageSkeletonVariant;
}

const PageSkeleton = memo(({ variant = 'default' }: PageSkeletonProps) => {
  const renderContent = () => {
    switch (variant) {
      case 'home':
        return (
          <>
            <div className={styles.skeletonHero}>
              <SkeletonBase variant="text" width="180px" height={16} borderRadius={20} />
              <SkeletonBase variant="text" width="55%" height={48} />
              <SkeletonBase variant="text" width="38%" height={18} />
              <SkeletonBase variant="rect" width="200px" height={50} borderRadius={25} />
            </div>
            <div className={styles.pageSkeletonInner}>
              <div style={{ margin: '60px 0', display: 'flex', flexDirection: 'column', gap: 48 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={styles.skeletonStatCard} style={{ minHeight: 180 }} />
                  ))}
                </div>
                <SkeletonBase variant="rect" width="100%" height={300} borderRadius={16} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonBase key={i} variant="rect" width="100%" height={160} borderRadius={12} />
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case 'nosotros':
        return (
          <>
            <div className={styles.skeletonHero} style={{ minHeight: 340 }}>
              <SkeletonBase variant="text" width="140px" height={14} borderRadius={20} />
              <SkeletonBase variant="text" width="50%" height={40} />
              <SkeletonBase variant="text" width="35%" height={16} />
            </div>
            <div className={styles.pageSkeletonInner}>
              <div style={{ margin: '60px 0', display: 'flex', flexDirection: 'column', gap: 48 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className={styles.skeletonStatCard} style={{ minHeight: 200 }} />
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonBase key={i} variant="rect" width="100%" height={140} borderRadius={12} />
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case 'servicios':
        return (
          <>
            <div className={styles.skeletonHero} style={{ minHeight: 300 }}>
              <SkeletonBase variant="text" width="160px" height={14} borderRadius={20} />
              <SkeletonBase variant="text" width="45%" height={40} />
              <SkeletonBase variant="text" width="30%" height={16} />
            </div>
            <div className={styles.pageSkeletonInner}>
              <div style={{ margin: '40px 0' }}>
                <div className={styles.skeletonCatalog}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={styles.skeletonCard} style={{ minHeight: 260 }} />
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      case 'contacto':
        return (
          <>
            <div className={styles.skeletonHero} style={{ minHeight: 300 }}>
              <SkeletonBase variant="text" width="140px" height={14} borderRadius={20} />
              <SkeletonBase variant="text" width="45%" height={40} />
              <SkeletonBase variant="text" width="30%" height={16} />
            </div>
            <div className={styles.pageSkeletonInner}>
              <div style={{ margin: '40px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={styles.skeletonStatCard} style={{ minHeight: 140 }} />
                  ))}
                </div>
                <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <SkeletonBase variant="rect" width="100%" height={400} borderRadius={12} />
                  <SkeletonBase variant="rect" width="100%" height={400} borderRadius={12} />
                </div>
              </div>
            </div>
          </>
        );

      case 'login':
        return (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', padding: 24,
          }}>
            <div style={{ width: '100%', maxWidth: 440 }}>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <SkeletonBase variant="circle" width={72} height={72} style={{ margin: '0 auto 16px' }} />
                <SkeletonBase variant="text" width="55%" height={28} style={{ margin: '0 auto' }} />
              </div>
              <div className={styles.skeletonForm}>
                <div className={styles.skeletonFormGroup}>
                  <SkeletonBase variant="text" width="30%" height={12} />
                  <SkeletonBase variant="rect" width="100%" height={46} borderRadius={10} />
                </div>
                <div className={styles.skeletonFormGroup}>
                  <SkeletonBase variant="text" width="30%" height={12} />
                  <SkeletonBase variant="rect" width="100%" height={46} borderRadius={10} />
                </div>
                <SkeletonBase variant="rect" width="100%" height={48} borderRadius={10} />
              </div>
            </div>
          </div>
        );

      case 'panel':
        return (
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <div style={{ width: 260, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px' }}>
                  <SkeletonBase variant="circle" width={20} height={20} />
                  <SkeletonBase variant="text" width="70%" height={14} />
                </div>
              ))}
            </div>
            <div style={{ flex: 1, padding: 24 }}>
              <SkeletonDashboard />
            </div>
          </div>
        );

      case 'producto':
        return (
          <div className={styles.pageSkeletonInner} style={{ marginTop: 32 }}>
            <SkeletonProductDetail />
          </div>
        );

      case 'checkout':
        return (
          <div className={styles.pageSkeletonInner} style={{ marginTop: 32 }}>
            <SkeletonBase variant="text" width="200px" height={14} />
            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
              <SkeletonForm fields={5} />
              <div className={styles.skeletonStatCard}>
                <SkeletonBase variant="text" width="60%" height={18} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <SkeletonBase variant="text" width="50%" height={14} />
                      <SkeletonBase variant="text" width="20%" height={14} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'blog':
        return (
          <div className={styles.pageSkeletonInner} style={{ marginTop: 40 }}>
            <SkeletonBlogGrid count={6} />
          </div>
        );

      case 'blogPost':
        return (
          <div className={styles.pageSkeletonInner} style={{ marginTop: 40 }}>
            <SkeletonBlogPost />
          </div>
        );

      case 'solicitudes':
        return (
          <>
            <div className={styles.skeletonHero} style={{ minHeight: 300 }}>
              <SkeletonBase variant="text" width="160px" height={14} borderRadius={20} />
              <SkeletonBase variant="text" width="45%" height={40} />
              <SkeletonBase variant="text" width="30%" height={16} />
            </div>
            <div className={styles.pageSkeletonInner}>
              <div style={{ margin: '40px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.skeletonStatCard} style={{ minHeight: 220 }} />
                ))}
              </div>
            </div>
          </>
        );

      case 'verify':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 520 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <SkeletonBase variant="circle" width={64} height={64} style={{ margin: '0 auto 16px' }} />
                <SkeletonBase variant="text" width="60%" height={26} style={{ margin: '0 auto' }} />
                <SkeletonBase variant="text" width="40%" height={14} style={{ margin: '8px auto 0' }} />
              </div>
              <div className={styles.skeletonForm}>
                <div className={styles.skeletonFormGroup}>
                  <SkeletonBase variant="rect" width="100%" height={50} borderRadius={10} />
                </div>
                <SkeletonBase variant="rect" width="100%" height={48} borderRadius={10} />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={styles.pageSkeletonInner} style={{ marginTop: 40 }}>
            <SkeletonBase variant="text" width="60%" height={32} />
            <div style={{ marginTop: 24 }}>
              <SkeletonTextBlock lines={6} />
            </div>
            <div style={{ marginTop: 32 }}>
              <SkeletonBase variant="rect" width="100%" height={300} borderRadius={12} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.pageSkeleton} role="status" aria-busy="true" aria-label="Página cargando">
      {renderContent()}
    </div>
  );
});

PageSkeleton.displayName = 'PageSkeleton';

export default PageSkeleton;
