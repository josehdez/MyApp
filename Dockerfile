#################################################################
# Dockerfile para configurar aplicación en node.js-Express
#################################################################

# Establece la imagen base
FROM node

# Informacion de Metadatos
LABEL "org.templado"="Jose Hernandez C"

# Crear directorio de trabajo
WORKDIR /opt/server

# Instala los paquetes existentes en el package.json
COPY package.json .
RUN npm install --quiet

#instala nodemon global
RUN npm install nodemon -g --quiet

# copia la aplicacion
COPY . .

# Expone la app en el puerto
EXPOSE 3000

# Inicia la aplicacion al iniciar el contenedor
CMD nodemon -L --watch . server.js