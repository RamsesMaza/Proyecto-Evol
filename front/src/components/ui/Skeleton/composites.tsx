import { memo } from 'react';
import SkeletonBase from './SkeletonBase';
import styles from './Skeleton.module.scss';

// ─── Card Skeleton ──────────────────────────────────────────

interface SkeletonCardProps {
  count?: number;
  variant?: 'default' | 'blog' | 'product';
}

export const SkeletonCard = memo(({ count = 1, variant = 'default' }: SkeletonCardProps) => {
  const items = Array.from({ length: count });

  if (count > 1) {
    return (
      <div className={styles.skeletonCatalog} role="status" aria-label="Cargando tarjetas">
        {items.map((_, i) => (
          <div
            key={i}
            style={{ '--skeleton-index': i } as React.CSSProperties}
            className={styles.skeletonCard}
            aria-hidden="true"
          >
            <div className={styles.skeletonCardImage}>
              <SkeletonBase variant="rect" width="100%" height="100%" borderRadius={0} index={i} />
            </div>
            <div className={styles.skeletonCardBody}>
              <SkeletonBase variant="text" width="38%" height={12} index={i} />
              <SkeletonBase variant="text" width="88%" height={16} index={i} />
              <SkeletonBase variant="text" width="62%" height={14} index={i} />
              <SkeletonBase variant="text" width="32%" height={18} index={i} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'blog') {
    return (
      <div className={styles.skeletonCard} aria-hidden="true">
        <div className={styles.skeletonCardImage}>
          <SkeletonBase variant="rect" width="100%" height="100%" borderRadius={0} />
        </div>
        <div className={styles.skeletonCardBody}>
          <SkeletonBase variant="text" width="28%" height={14} />
          <SkeletonBase variant="text" width="92%" height={18} />
          <SkeletonBase variant="text" width="72%" height={14} />
          <SkeletonBase variant="text" width="42%" height={12} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      <div className={styles.skeletonCardImage}>
        <SkeletonBase variant="rect" width="100%" height="100%" borderRadius={0} />
      </div>
      <div className={styles.skeletonCardBody}>
        <SkeletonBase variant="text" width="40%" height={12} />
        <SkeletonBase variant="text" width="85%" height={16} />
        <SkeletonBase variant="text" width="60%" height={14} />
        <SkeletonBase variant="text" width="35%" height={18} />
      </div>
    </div>
  );
});
SkeletonCard.displayName = 'SkeletonCard';

// ─── Table Skeleton ─────────────────────────────────────────

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

const TABLE_WIDTHS = [
  ['30%', '45%', '20%', '55%', '35%'],
  ['55%', '30%', '45%', '25%', '50%'],
  ['40%', '55%', '30%', '45%', '30%'],
  ['50%', '35%', '50%', '35%', '45%'],
  ['35%', '50%', '35%', '50%', '40%'],
  ['45%', '40%', '40%', '30%', '55%'],
];

export const SkeletonTable = memo(({ rows = 5, columns = 4 }: SkeletonTableProps) => (
  <div className={styles.skeletonTable} role="status" aria-label="Cargando tabla">
    <div className={styles.skeletonTableHeader}>
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonBase key={i} variant="text" width={TABLE_WIDTHS[0][i] || '40%'} height={14} inline />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className={styles.skeletonTableRow} style={{ '--skeleton-index': r } as React.CSSProperties}>
        {Array.from({ length: columns }).map((_, c) => (
          <SkeletonBase
            key={c}
            variant="text"
            width={TABLE_WIDTHS[Math.min(r + 1, TABLE_WIDTHS.length - 1)][c] || '40%'}
            height={12}
            inline
          />
        ))}
      </div>
    ))}
  </div>
));
SkeletonTable.displayName = 'SkeletonTable';

// ─── Form Skeleton ──────────────────────────────────────────

interface SkeletonFormProps {
  fields?: number;
}

export const SkeletonForm = memo(({ fields = 4 }: SkeletonFormProps) => (
  <div className={styles.skeletonForm} role="status" aria-label="Cargando formulario">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className={styles.skeletonFormGroup} style={{ '--skeleton-index': i } as React.CSSProperties}>
        <SkeletonBase variant="text" width="25%" height={12} index={i} />
        <SkeletonBase variant="rect" width="100%" height={44} borderRadius={8} index={i} />
      </div>
    ))}
    <SkeletonBase variant="rect" width="100%" height={48} borderRadius={10} index={fields} />
  </div>
));
SkeletonForm.displayName = 'SkeletonForm';

// ─── Hero Skeleton ──────────────────────────────────────────

export const SkeletonHero = memo(() => (
  <div className={styles.skeletonHero} role="status" aria-label="Cargando portada">
    <SkeletonBase variant="text" width="180px" height={16} borderRadius={20} />
    <SkeletonBase variant="text" width="56%" height={48} />
    <SkeletonBase variant="text" width="38%" height={18} />
    <SkeletonBase variant="rect" width="200px" height={50} borderRadius={25} />
  </div>
));
SkeletonHero.displayName = 'SkeletonHero';

// ─── Sidebar Skeleton ───────────────────────────────────────

interface SkeletonSidebarProps {
  items?: number;
}

export const SkeletonSidebar = memo(({ items = 6 }: SkeletonSidebarProps) => (
  <div className={styles.skeletonSidebar} role="status" aria-label="Cargando menú lateral">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className={styles.skeletonSidebarItem} style={{ '--skeleton-index': i } as React.CSSProperties}>
        <SkeletonBase variant="circle" width={20} height={20} index={i} />
        <SkeletonBase variant="text" width={`${[55, 70, 45, 65, 50, 75][i] || 60}%`} height={14} index={i} />
      </div>
    ))}
  </div>
));
SkeletonSidebar.displayName = 'SkeletonSidebar';

// ─── Catalog Skeleton (product grid) ────────────────────────

interface SkeletonCatalogProps {
  count?: number;
}

export const SkeletonCatalog = memo(({ count = 6 }: SkeletonCatalogProps) => (
  <div className={styles.skeletonCatalog} role="status" aria-label="Cargando catálogo">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{ '--skeleton-index': i } as React.CSSProperties}
        className={styles.skeletonCard}
        aria-hidden="true"
      >
        <div className={styles.skeletonCardImage}>
          <SkeletonBase variant="rect" width="100%" height="100%" borderRadius={0} index={i} />
        </div>
        <div className={styles.skeletonCardBody}>
          <SkeletonBase variant="text" width="38%" height={12} index={i} />
          <SkeletonBase variant="text" width="85%" height={16} index={i} />
          <SkeletonBase variant="text" width="60%" height={14} index={i} />
          <SkeletonBase variant="text" width="32%" height={18} index={i} />
        </div>
      </div>
    ))}
  </div>
));
SkeletonCatalog.displayName = 'SkeletonCatalog';

// ─── Product Detail Skeleton ─────────────────────────────────

export const SkeletonProductDetail = memo(() => (
  <div className={styles.skeletonProductDetail} role="status" aria-label="Cargando producto">
    <SkeletonBase variant="text" width="200px" height={14} />

    <div className={styles.skeletonProductMain}>
      <div className={styles.skeletonImageCol}>
        <SkeletonBase variant="rect" width="100%" height={420} borderRadius={12} />
        <div style={{ display: 'flex', gap: 10 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBase key={i} variant="rect" width={76} height={76} borderRadius={10} index={i} />
          ))}
        </div>
      </div>
      <div className={styles.skeletonInfoCol}>
        <SkeletonBase variant="text" width="28%" height={14} />
        <SkeletonBase variant="text" width="82%" height={30} />
        <SkeletonBase variant="text" width="48%" height={16} />
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBase key={i} variant="rect" width={18} height={18} borderRadius={4} index={i} />
          ))}
        </div>
        <SkeletonBase variant="text" width="38%" height={36} />
        <SkeletonBase variant="text" width="100%" height={14} count={3} gap={8} />
        <div style={{ display: 'flex', gap: 14 }}>
          <SkeletonBase variant="rect" width={130} height={46} borderRadius={10} />
          <SkeletonBase variant="rect" width={210} height={46} borderRadius={10} />
        </div>
      </div>
    </div>

    <div className={styles.skeletonTabsArea}>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBase key={i} variant="rect" width={140} height={42} borderRadius={8} index={i} />
        ))}
      </div>
      <SkeletonBase variant="text" width="100%" height={14} count={5} gap={10} />
    </div>

    <div>
      <SkeletonBase variant="text" width="180px" height={24} />
      <div className={styles.skeletonRelated} style={{ marginTop: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBase key={i} variant="rect" width="100%" height={220} borderRadius={12} index={i} />
        ))}
      </div>
    </div>
  </div>
));
SkeletonProductDetail.displayName = 'SkeletonProductDetail';

// ─── Blog Grid Skeleton ─────────────────────────────────────

interface SkeletonBlogGridProps {
  count?: number;
}

export const SkeletonBlogGrid = memo(({ count = 6 }: SkeletonBlogGridProps) => (
  <div className={styles.skeletonBlogGrid} role="status" aria-label="Cargando blog">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{ '--skeleton-index': i } as React.CSSProperties}
        className={styles.skeletonCard}
        aria-hidden="true"
      >
        <div className={styles.skeletonCardImage}>
          <SkeletonBase variant="rect" width="100%" height="100%" borderRadius={0} index={i} />
        </div>
        <div className={styles.skeletonCardBody}>
          <SkeletonBase variant="text" width="28%" height={14} index={i} />
          <SkeletonBase variant="text" width="92%" height={18} index={i} />
          <SkeletonBase variant="text" width="72%" height={14} index={i} />
          <SkeletonBase variant="text" width="42%" height={12} index={i} />
        </div>
      </div>
    ))}
  </div>
));
SkeletonBlogGrid.displayName = 'SkeletonBlogGrid';

// ─── Blog Post Skeleton ──────────────────────────────────────

export const SkeletonBlogPost = memo(() => (
  <div className={styles.skeletonBlogPost} role="status" aria-label="Cargando artículo">
    <div className={styles.skeletonBlogContent}>
      <SkeletonBase variant="text" width="100px" height={14} />
      <SkeletonBase variant="text" width="76%" height={38} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <SkeletonBase variant="circle" width={42} height={42} />
        <SkeletonBase variant="text" width="140px" height={14} />
      </div>
      <SkeletonBase variant="rect" width="100%" height={380} borderRadius={12} />
      <div style={{ marginTop: 10 }}>
        <SkeletonBase variant="text" width="100%" height={16} count={10} gap={12} />
      </div>
    </div>
    <div className={styles.skeletonBlogSidebar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SkeletonBase variant="text" width="55%" height={16} />
        <SkeletonBase variant="rect" width="100%" height={42} borderRadius={8} />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ '--skeleton-index': i } as React.CSSProperties}>
          <SkeletonBase variant="text" width="48%" height={16} index={i} />
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBase variant="text" width="88%" height={12} index={i} />
            <SkeletonBase variant="text" width="65%" height={12} index={i} />
          </div>
        </div>
      ))}
    </div>
  </div>
));
SkeletonBlogPost.displayName = 'SkeletonBlogPost';

// ─── Dashboard Skeleton ──────────────────────────────────────

interface SkeletonDashboardProps {
  statCards?: number;
}

export const SkeletonDashboard = memo(({ statCards = 4 }: SkeletonDashboardProps) => (
  <div className={styles.skeletonDashboard} role="status" aria-label="Cargando panel">
    <div className={styles.skeletonDashboardGrid}>
      {Array.from({ length: statCards }).map((_, i) => (
        <div key={i} className={styles.skeletonStatCard} style={{ '--skeleton-index': i } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <SkeletonBase variant="text" width="50%" height={14} index={i} />
            <SkeletonBase variant="circle" width={36} height={36} index={i} />
          </div>
          <SkeletonBase variant="text" width="55%" height={30} index={i} />
          <SkeletonBase variant="text" width="28%" height={12} index={i} />
        </div>
      ))}
    </div>

    <div className={styles.skeletonDashboardChart}>
      <div className={styles.skeletonStatCard} style={{ minHeight: 280 }}>
        <SkeletonBase variant="text" width="35%" height={16} />
        <SkeletonBase variant="rect" width="100%" height={210} borderRadius={10} />
      </div>
      <div className={styles.skeletonStatCard}>
        <SkeletonBase variant="text" width="45%" height={16} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SkeletonBase variant="circle" width={10} height={10} index={i} />
              <SkeletonBase variant="text" width="72%" height={12} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div>
      <SkeletonBase variant="text" width="28%" height={20} />
      <div style={{ marginTop: 14 }}>
        <SkeletonTable rows={4} columns={5} />
      </div>
    </div>
  </div>
));
SkeletonDashboard.displayName = 'SkeletonDashboard';

// ─── Text Block Skeleton ────────────────────────────────────

interface SkeletonTextBlockProps {
  lines?: number;
}

export const SkeletonTextBlock = memo(({ lines = 4 }: SkeletonTextBlockProps) => (
  <div className={styles.skeletonTextBlock} role="status" aria-label="Cargando contenido">
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBase
        key={i}
        variant="text"
        width={i === lines - 1 ? '52%' : '100%'}
        height={14}
        index={i}
      />
    ))}
  </div>
));
SkeletonTextBlock.displayName = 'SkeletonTextBlock';

// ─── Avatar Skeleton ────────────────────────────────────────

interface SkeletonAvatarProps {
  size?: number;
  withText?: boolean;
}

export const SkeletonAvatar = memo(({ size = 40, withText = true }: SkeletonAvatarProps) => (
  <div className={styles.skeletonAvatar} role="status" aria-label="Cargando perfil">
    <SkeletonBase variant="circle" width={size} height={size} />
    {withText && (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <SkeletonBase variant="text" width="48%" height={14} />
        <SkeletonBase variant="text" width="28%" height={11} />
      </div>
    )}
  </div>
));
SkeletonAvatar.displayName = 'SkeletonAvatar';

// ─── Image Skeleton ─────────────────────────────────────────

interface SkeletonImageProps {
  aspectRatio?: string;
  borderRadius?: number;
}

export const SkeletonImage = memo(({ aspectRatio = '16 / 9', borderRadius = 10 }: SkeletonImageProps) => (
  <div className={styles.skeletonImage} style={{ aspectRatio, borderRadius }} role="status" aria-label="Cargando imagen">
    <SkeletonBase variant="rect" width="100%" height="100%" borderRadius={borderRadius} />
  </div>
));
SkeletonImage.displayName = 'SkeletonImage';
