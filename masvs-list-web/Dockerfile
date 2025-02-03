# Dockerfile para proyecto Express con Node.js 22

FROM node:22

# Establecer el directorio de trabajo en /app
WORKDIR /app

# Copiar los archivos de configuración de la aplicación
COPY package.json package-lock.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación al directorio de trabajo
COPY . .

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

# Comando para ejecutar la aplicación
CMD ["npm", "run", "dev","--host"]
