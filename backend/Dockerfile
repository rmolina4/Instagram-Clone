FROM node:23.5

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV port=8080

EXPOSE 8080

CMD [ "npm", "start"]