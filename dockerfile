# Stage 1: Build the React app
FROM node:18 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and yarn.lock files to the working directory
COPY package.json yarn.lock ./

# Install the dependencies using Yarn
RUN yarn install

# Copy the rest of the application source code to the working directory
COPY . .

# Build the React application
RUN yarn vite build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine


# Copy the built React app from the previous stage to the Nginx public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the port on which Nginx will run
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]