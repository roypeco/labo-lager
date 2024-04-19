FROM node:20.11.1
WORKDIR /app/react-app/front
COPY package*.json ./
RUN yarn install
COPY . ../
ENTRYPOINT [ "npm", "start" ]
