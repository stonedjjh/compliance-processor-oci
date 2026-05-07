import React, { type ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps {
  children: ReactNode;
  className?: string;
}

// 1. Sub-componentes
const CardImage: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className={styles.cardImage}>{children}</div>
);

const CardHeader: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <div className={styles.cardHeader}>
    <h3>{title}</h3>
    {subtitle && <p>{subtitle}</p>}
  </div>
);

const CardBody: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className={styles.cardBody}>{children}</div>
);

const CardFooter: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className={styles.cardFooter}>{children}</div>
);

// 2. Componente Principal
const Card: React.FC<CardProps> & {
  Image: React.FC<{ children: ReactNode }>;
  Header: React.FC<{ title: string; subtitle?: string }>;
  Body: React.FC<{ children: ReactNode }>;
  Footer: React.FC<{ children: ReactNode }>;
} = ({ children, className = "" }) => {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
};

// 3. Asignación del Namespace
Card.Image = CardImage;
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
