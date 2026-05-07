import React, { type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.css";

// Definimos las variantes disponibles
type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string; // Para permitir ajustes locales si es necesario
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  // Combinamos las clases de CSS Modules
  const buttonClass = `${styles.btn} ${styles[variant]} ${className}`;

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};

export default Button;
