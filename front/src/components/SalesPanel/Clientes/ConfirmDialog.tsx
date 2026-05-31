import { FaExclamationTriangle } from 'react-icons/fa';
import styles from '../SalesClientes.module.scss';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger, onConfirm, onCancel }: ConfirmDialogProps) => (
  <div className={styles.modalOverlay} onClick={onCancel}>
    <div className={styles.confirmDialog} onClick={e => e.stopPropagation()}>
      <div className={`${styles.confirmIcon} ${danger ? styles.confirmIconDanger : ''}`}>
        <FaExclamationTriangle />
      </div>
      <h3 className={styles.confirmTitle}>{title}</h3>
      <p className={styles.confirmMessage}>{message}</p>
      <div className={styles.confirmBtns}>
        <button className={styles.modalBtnSecondary} onClick={onCancel}>{cancelLabel}</button>
        <button className={`${styles.modalBtnPrimary} ${danger ? styles.btnDanger : ''}`} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
