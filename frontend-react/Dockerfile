# Etapa 1: Construcción
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor de producción
FROM nginx:alpine
# Copiamos los archivos estáticos generados por Vite
COPY --from=build /app/dist /usr/share/nginx/html
# Copiamos una configuración básica de Nginx para manejar rutas de SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]