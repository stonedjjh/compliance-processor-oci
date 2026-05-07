# Guia de Uso: Componente Input

El componente Input es una implementacion estandarizada del campo de entrada de texto de HTML5, extendido con soporte nativo para etiquetas (labels) y mensajes de validacion (errores). Esta disenado para mantener la coherencia visual en todos los formularios de la plataforma.

## Estructura del Componente

El componente encapsula la logica de accesibilidad vinculando automaticamente el label con el input mediante un ID unico si no se proporciona uno.

1. Label: Texto descriptivo situado sobre el campo.
2. Input Field: El campo de texto con estilos basados en la paleta global.
3. Error Message: Mensaje de validacion que aparece debajo del campo cuando la propiedad error esta presente.

## Propiedades (Props)

Al extender InputHTMLAttributes<HTMLInputElement>, el componente acepta todas las propiedades estandar de un input de React (type, value, onChange, placeholder, required, etc.), ademas de las siguientes:

| Prop      | Tipo   | Descripcion                                                                          |
| :-------- | :----- | :----------------------------------------------------------------------------------- |
| label     | string | Texto que aparecera sobre el input.                                                  |
| error     | string | Si se proporciona, el input cambiara a estado de error y mostrara este texto debajo. |
| className | string | Clases adicionales para personalizar el contenedor externo.                          |

---

## Ejemplos de Implementacion

### 1. Uso Estandar (Login/Registro)

```tsx
<Input
  label="Correo Electronico"
  type="email"
  placeholder="ejemplo@correo.com"
  value={email}
  onChange={handleEmailChange}
  required
/>
```

### 2. Estado de Error (Validacion)

```tsx
<Input
  label="Contrasena"
  type="password"
  error="La contrasena debe tener al menos 8 caracteres"
  value={password}
  onChange={handlePasswordChange}
/>
```

> [!NOTE]
> Notas de Diseno
> **Feedback Visual:** El componente incluye un efecto de foco (focus) con un sutil resplandor (box-shadow) basado en el color primario de la aplicacion.
>
> **Consistencia:** El fondo utiliza var(--color-bg-alt) y bordes redondeados de 8px para coincidir con la estetica de los botones y cards de la interfaz.
