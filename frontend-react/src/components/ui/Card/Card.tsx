import React, { type ReactNode } from "react";
import styles from "./Card.module.css";

// Definimos el tipo de alineación
type Alignment = "left" | "center" | "right";

interface CardProps {
  children: ReactNode;
  className?: string;
  isHoverable?: boolean;
}

// 1. Sub-componentes con soporte para alineación
const CardImage: React.FC<{ children: ReactNode; align?: Alignment }> = ({
  children,
  align = "left",
}) => <div className={`${styles.cardImage} ${styles[align]}`}>{children}</div>;

const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  align?: Alignment;
}> = ({ title, subtitle, align = "left" }) => (
  <div className={`${styles.cardHeader} ${styles[`text-${align}`]}`}>
    <h3>{title}</h3>
    {subtitle && <p>{subtitle}</p>}
  </div>
);

const CardBody: React.FC<{ children: ReactNode; align?: Alignment }> = ({
  children,
  align = "left",
}) => (
  <div className={`${styles.cardBody} ${styles[`text-${align}`]}`}>
    {children}
  </div>
);

// El resto del componente Card se mantiene igual...
const Card: React.FC<CardProps> & {
  Image: React.FC<{ children: ReactNode; align?: Alignment }>;
  Header: React.FC<{ title: string; subtitle?: string; align?: Alignment }>;
  Body: React.FC<{ children: ReactNode; align?: Alignment }>;
  Footer: React.FC<{ children: ReactNode }>;
} = ({ children, className = "", isHoverable = true }) => {
  return (
    <div
      className={`${styles.card} ${isHoverable ? styles.hoverable : ""} ${className}`}
    >
      {children}
    </div>
  );
};

Card.Image = CardImage;
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = ({ children }) => (
  <div className={styles.cardFooter}>{children}</div>
);

export default Card;
