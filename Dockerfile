FROM node:18

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

COPY . .

# Install dotenv for environment variables
RUN npm install dotenv

# Specify environment variables at build time (optional)
ARG S3_BUCKET
ARG REGION
ARG API_TOKEN
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG IS_LAMBDA

EXPOSE 3000

CMD ["node", "server.js"]