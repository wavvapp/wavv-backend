# Use the official Node.js image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm i -g pnpm
RUN pnpm install

# Copy the rest of the application code
COPY . .

# app env variables
ARG POSTGRES_HOST
ARG POSTGRES_HOST
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG POSTGRES_DB

ENV POSTGRES_HOST=$POSTGRES_HOST \
    POSTGRES_HOST=$POSTGRES_HOST \
    POSTGRES_USER=$POSTGRES_USER \
    POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
    POSTGRES_DB=$POSTGRES_DB

# Build the TypeScript code
RUN npm run db:migrate

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the app
CMD ["node", "dist/index.js"]