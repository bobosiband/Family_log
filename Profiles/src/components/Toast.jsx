import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./Toast.module.css";

export function Toast({ message, type = "info", onDismiss, duration = 3500 }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  return (
    <motion.div
      className={`${styles.toast} ${styles[type]}`}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      <span>{message}</span>
      <button
        type="button"
        className={styles.closeToast}
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        &#215;
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className={styles.container} aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onDismiss={() => onDismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
