import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../../components/ui/Button/Button";
import Card from "../../components/ui/Card/Card"; // <--- Importamos el nuevo Card
import usePageMetadata from "../../hooks/usePageMetadata";
import styles from "./Home.module.css";

import heroImage from "../../assets/compliance-hero.png";

const Home: React.FC = () => {
  usePageMetadata({
    title: "Compliance Processor | Inicio",
    description:
      "Plataforma para la gestión de cumplimiento y análisis documental con auditoría y trazabilidad seguras.",
    keywords: "cumplimiento, documentos, auditoría, gestión documental, SaaS",
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <main className={styles.mainContainer}>
      {/* === SECCIÓN HERO === */}
      <section className={styles.heroSection}>
        <div className={styles.heroLayout}>
          <div className={styles.heroVisual}>
            <img src={heroImage} alt="Flujo de cumplimiento tecnológico" />
          </div>

          <div className={styles.heroContent}>
            <h1>Gestión Inteligente de Cumplimiento</h1>
            <p>
              Automatice el análisis documental, audite operaciones y garantice
              la trazabilidad total de sus activos con nuestra arquitectura
              distribuida de alto rendimiento.
            </p>

            <div className={styles.heroActions}>
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  onClick={() => navigate("/dashboard/upload")}
                >
                  Ir al Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/auth/login")}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/auth/register")}
                  >
                    Registrarse
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* === SECCIÓN CAPACIDADES (REFACTORIZADA CON CARDS) === */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.featuresTitle}>Capacidades de la Plataforma</h2>
          <div className={styles.grid}>
            <Card>
              <Card.Image align="center">📄</Card.Image>
              <Card.Header align="center" title="Procesamiento Documental" />
              <Card.Body>
                Carga segura y análisis en tiempo real. Extracción automática de
                metadatos y validación bajo estándares corporativos.
              </Card.Body>
            </Card>

            <Card>
              <Card.Image align="center">👤</Card.Image>
              <Card.Header align="center" title="Auditoría de Acceso" />
              <Card.Body>
                Gestión granular de perfiles y trazabilidad de cada operación
                para una auditoría transparente y segura.
              </Card.Body>
            </Card>

            <Card>
              <Card.Image align="center">📊</Card.Image>
              <Card.Header align="center" title="Monitoreo Activo" />
              <Card.Body>
                Visualización del estado de cumplimiento de sus activos y
                documentos con un sistema de alertas proactivas.
              </Card.Body>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
