FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source (in production, would copy dist instead)
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
