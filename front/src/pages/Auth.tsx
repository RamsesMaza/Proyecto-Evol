import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../components/Auth/Auth.module.scss';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm';
import Modal from '../components/Modal/Modal';
import { FaArrowLeft } from 'react-icons/fa';

type AuthMode = 'login' | 'register' | 'forgot_password';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode; onCloseCallback?: () => void }>({
    title: '',
    content: null,
  });

  const handleShowModal = (content: React.ReactNode, title: string = 'Mensaje', onCloseCallback?: () => void) => {
    setModalContent({ title, content, onCloseCallback });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (modalContent.onCloseCallback) {
      modalContent.onCloseCallback();
    }
  };

  return (
    <div className={styles.authPage}>
      <Link to="/" className={styles.backBtn}>
        <FaArrowLeft /> Volver al Inicio
      </Link>

      <div className={`${styles.authContainer} ${mode === 'register' ? styles.signUpMode : ''}`}>
        
        <div className={styles.authImage}>
          {/* Imagen de fondo limpia */}
        </div>

        <div className={styles.authFormContainer}>
          <div className={styles.formInnerWrapper}>
            {mode === 'login' && <LoginForm onSwitchMode={setMode} onSuccess={handleShowModal} />}
            {mode === 'register' && <RegisterForm onSwitchMode={setMode} onSuccess={handleShowModal} onShowTerms={handleShowModal} />}
            {mode === 'forgot_password' && <ForgotPasswordForm onSwitchMode={setMode} onSuccess={handleShowModal} />}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalContent.title}>
        {modalContent.content}
      </Modal>
    </div>
  );
};

export default Auth;
