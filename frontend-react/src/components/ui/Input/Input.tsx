import React, { type InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Etiqueta opcional sobre el input
  error?: string; // Mensaje de error opcional
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  className = "",
  ...props
}) => {
  const inputId = id || `input-${props.name}`;

  return (
    <div className={styles.inputWrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.inputError : ""} ${className}`}
        {...props}
      />

      {/* El contenedor siempre existe, pero el mensaje solo se renderiza si hay error */}
      <div className={styles.errorArea}>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    </div>
  );
};

export default Input;
