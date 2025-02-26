# Use the official Node.js image as the base image
FROM node:20.17

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
ARG NODE_ENV
ARG DATABASE_URL

ENV DATABASE_URL=$DATABASE_URL
ENV NODE_ENV=production

# Build the TypeScript code
RUN pnpm run build

# Build the TypeScript code
# RUN pnpm run migration:run

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the app
CMD ["node", "dist/index.js"]
