# ---- Stage 1: Build the React application ----
# Use a specific version of Node.js for reproducibility. 'alpine' is a lightweight version.
FROM node:20-alpine as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
# This leverages Docker's layer caching. If these files don't change,
# 'npm install' won't run again on subsequent builds, speeding things up.
COPY package*.json ./
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Run the production build script defined in package.json (usually 'vite build')
RUN npm run build


# ---- Stage 2: Serve the application with Nginx ----
# Use a lightweight and stable version of Nginx
FROM nginx:stable-alpine

# Copy the built static files from the 'builder' stage to the default Nginx public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# For Single Page Applications (SPA) like React, Nginx needs to be configured
# to redirect all routes to index.html to let React Router handle them.
# Copy a custom nginx configuration file into the container.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# The default command for the nginx image is to start the server, so CMD is not needed.```

