FROM node:20.11.1
WORKDIR /app/react-app
COPY package*.json ./
RUN yarn install
COPY . ./react-app
# ENTRYPOINT [ "npm", "start" ]
