# Etapa 1: Construcción
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Definir los argumentos que vendrán desde el exterior
ARG VITE_API_URL
ARG VITE_SOCKET_URL

# Convertirlos en variables de entorno para que Vite los vea durante el build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

RUN npm run build

# Etapa 2: Servidor de producción
FROM nginx:alpine
# Copiamos los archivos estáticos generados por Vite
COPY --from=build /app/dist /usr/share/nginx/html
# Copiamos una configuración básica de Nginx para manejar rutas de SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]