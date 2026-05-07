# Guia de Uso: Componente Card

El componente Card utiliza el patron de Compound Components para ofrecer una estructura flexible, semantica y altamente reutilizable. Esta diseñado para adaptarse tanto a landing pages como a dashboards complejos.

## Estructura del Componente

El componente se compone de un contenedor principal y cuatro sub-componentes especializados:

1. Card: Contenedor raiz que gestiona el borde, fondo y efectos de elevacion (hover).
2. Card.Image: Espacio para iconos o ilustraciones.
3. Card.Header: Contenedor para el titulo y subtitulo opcional.
4. Card.Body: Espacio para el contenido principal o descripciones.
5. Card.Footer: Area para acciones (botones) o metadatos, con separador visual.

## Propiedades (Props)

### Prop: align

Disponible en Card.Image, Card.Header y Card.Body. Define la alineacion horizontal del contenido.

| Valor          | Descripcion                                                                          |
| :------------- | :----------------------------------------------------------------------------------- |
| left (default) | Alinea el contenido a la izquierda. Ideal para dashboards densos.                    |
| center         | Alinea el contenido al centro. Recomendado para secciones Hero o de caracteristicas. |
| right          | Alinea el contenido a la derecha.                                                    |

---

## Ejemplos de Implementacion

### 1. Alineacion Centrada (Estilo Landing Page)

```tsx
<Card>
  <Card.Image align="center">Documento</Card.Image>
  <Card.Header
    align="center"
    title="Procesamiento"
    subtitle="Analisis en tiempo real"
  />
  <Card.Body align="center">
    Carga segura y validacion bajo estandares corporativos.
  </Card.Body>
</Card>
```

### 2. Alineacion a la Izquierda con Footer (Estilo Dashboard)

```tsx
<Card>
  <Card.Header title="Documento_Final.pdf" subtitle="Subido hace 2 horas" />
  <Card.Body>
    El documento ha pasado todas las validaciones de cumplimiento tecnico.
  </Card.Body>
  <Card.Footer>
    <Button variant="outline">Ver detalles</Button>
  </Card.Footer>
</Card>
```

> [!NOTE]
> Notas de Diseno
>
> 1. **Interactividad:** Todas las cards incluyen una transicion de elevacion (translateY) y sombra al hacer hover para mejorar el feedback visual.
> 2. **Responsividad:** El componente hereda el ancho del contenedor padre (generalmente controlado por un Grid en la vista).
