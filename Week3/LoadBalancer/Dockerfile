FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production || true

COPY . .

CMD ["node", "server1.js"]
