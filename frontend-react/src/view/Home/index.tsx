const Home = () => {
  return (
    <section>
      <header>
        <h1>Panel de Control de Cumplimiento</h1>
        <p><strong>Gestión centralizada de auditoría y procesamiento de activos.</strong></p>
      </header>

      <hr />

      <article>
        <h2>Bienvenido al Sistema</h2>
        <p>
          Esta plataforma permite la carga, validación y seguimiento de documentos bajo 
          estándares de seguridad empresarial. El procesamiento se realiza en tiempo real 
          mediante una arquitectura distribuida y escalable.
        </p>
      </article>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <section>
          <h3>Gestión de Documentos</h3>
          <p>Utilice el módulo de subida para procesar nuevos archivos. El procesador extraerá y validará la información automáticamente.</p>
        </section>

        <section>
          <h3>Acceso y Registro</h3>
          <p>Gestione los perfiles de usuario y niveles de acceso para garantizar la trazabilidad de cada operación en el sistema.</p>
        </section>
      </div>

      <footer style={{ marginTop: '40px', fontSize: '0.9rem', color: '#666' }}>
        <p>Estado de la infraestructura: Operacional | Arquitectura: ARM64/x86_64</p>
      </footer>
    </section>
  );
};

export default Home;