# ---- Stage 1: Build the React application ----
# Use a specific version of Node.js for reproducibility. 'alpine' is a lightweight version.
FROM node:20-alpine as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker's layer caching.
COPY package*.json ./

# Install dependencies. This step is only re-run if package files change.
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Run the production build script defined in package.json. This creates the static files.
RUN npm run build


# ---- Stage 2: Serve the application with Nginx ----
# This stage creates the final, small, and secure production image.
FROM nginx:stable-alpine

# Copy the built static files from the 'builder' stage into the Nginx server's root directory.
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the Nginx configuration. This file is crucial for making sure the
# Nginx server inside the container correctly handles SPA routing by
# redirecting all requests to index.html.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80. This declares that the container listens on port 80.
# The Kubernetes Service will target this port.
EXPOSE 80

# The default command for the nginx image is to start the server, so an explicit CMD is not needed.
# It automatically runs `nginx -g 'daemon off;'`