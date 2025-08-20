# Use the official Node.js image as our base
# FROM node:22-slim
# ARG NODE_VERSION=22.15.0
# ARG NODE_VERSION=21.7.1

# FROM node:${NODE_VERSION}-alpine
FROM node:lts-alpine3.17



# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
# COPY package.json ./
COPY . .


# Install app dependencies
RUN npm install

# Copy the rest of our app's source code into the container

# Expose the port the app will run on
EXPOSE 5502

# The command to run our app
CMD ["npm", "run", "dev"]