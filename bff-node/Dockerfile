FROM node:20-alpine

WORKDIR /app

# Instalamos curl para que el healthcheck de Docker pueda funcionar (opcional pero recomendado)
RUN apk add --no-cache curl

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias de producción y desarrollo (necesarias para compilar TS)
RUN npm install

# Copiamos el resto del código
COPY . .

# Compilamos el código TypeScript a JavaScript (genera la carpeta /dist)
RUN npm run build

EXPOSE 4000

# Ejecutamos el código compilado
CMD ["npm", "start"]