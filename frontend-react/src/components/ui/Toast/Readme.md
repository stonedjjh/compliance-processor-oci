# Guia de Uso: Componente Toast

El componente Toast es un sistema de notificaciones no intrusivo (flotante) diseñado para proveer retroalimentacion temporal al usuario sobre el resultado de una accion (exito, error o informacion).

## Estructura del Componente

El componente renderiza un contenedor flotante fijo en la esquina inferior derecha de la pantalla. Incluye:

1. **Mensaje:** Texto descriptivo de la notificacion.
2. **Boton de cierre:** Un control manual (`&times;`) para descartar el mensaje de inmediato.
3. **Animaciones:** Transiciones CSS nativas de entrada (deslizamiento hacia arriba) y salida (desvanecimiento y descenso).
4. **Temporizador:** Logica de auto-ocultado basada en la duracion especificada.

## Propiedades (Props)

| Prop       | Tipo                             | Por defecto   | Descripcion                                                                                                                           |
| :--------- | :------------------------------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------ |
| `message`  | `string`                         | **Requerido** | El texto que se mostrara en la notificacion.                                                                                          |
| `type`     | `"success" \| "error" \| "info"` | `"info"`      | Determina el color semantico del Toast (verde, rojo, o azul).                                                                         |
| `duration` | `number`                         | `3000`        | Tiempo en milisegundos que el Toast permanecera visible antes de cerrarse automaticamente.                                            |
| `onClose`  | `() => void`                     | **Requerido** | Funcion callback que se ejecuta tras terminar la animacion de cierre. Util para limpiar el estado del mensaje en el componente padre. |

---

## Ejemplos de Implementacion

### 1. Notificacion de Exito

```tsx
<Toast
  message="¡Registro completado con exito!"
  type="success"
  duration={4000}
  onClose={() => setToastMessage("")}
/>
```

### 2. Uso Condicional Estandar en Vistas

```tsx
{
  errorMensaje && (
    <Toast
      message={errorMensaje}
      type="error"
      onClose={() => setErrorMensaje("")}
    />
  );
}
```

> [!NOTE]
> **Notas de Diseno**
> **Superposicion:** El componente cuenta con un `z-index: 9999` para garantizar que siempre flote por encima de Navbars, Cards y modales. Utiliza opacidad y `transform: translateY` en lugar de cambiar propiedades de dimension, asegurando animaciones suaves sin provocar saltos (Layout Shifts) en la interfaz principal.
