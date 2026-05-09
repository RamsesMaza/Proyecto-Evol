import styles from "./ContactMap.module.scss";

const ContactMap = () => {
  return (
    <div className={styles.mapWrapper}>
      <iframe 
        title="Ubicación ACS"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.585532585354!2d-77.0691501!3d-11.9685386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cf4cb6347f8d%3A0xc0747444c1844b20!2sCalle%20Chasquitambo%20576%2C%20Los%20Olivos%2015301!5e0!3m2!1ses!2spe!4v1713650000000!5m2!1ses!2spe"
        width="100%" 
        height="100%" 
        style={{ border: 0 }} 
        allowFullScreen 
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default ContactMap;