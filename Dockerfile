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

### Step 2: Create the Nginx Configuration File

Your React application uses client-side routing. This means if you navigate to a page like `/my-character` and hit refresh, the browser will ask the server for that specific path. Nginx will return a 404 error by default because that file doesn't exist on the server.

To fix this, you must tell Nginx to serve `index.html` for any route it can't find. Create a new file named `nginx.conf` in the root of your project with the following content.

```nginx
server {
  listen 80;
  server_name localhost;

  # Set the root directory to where our static files are
  root /usr/share/nginx/html;

  # This is the main configuration for a Single Page Application (SPA)
  location / {
    # First, try to serve the requested file as-is ($uri)
    # If it's a directory, try that ($uri/)
    # If neither is found, fall back to serving /index.html
    # This lets React Router take over the routing.
    try_files $uri $uri/ /index.html;
  } 

  # Add any other specific configurations here if needed.
  # For example, to handle gzipped files to improve performance:
  location ~* \.(css|js)$ {
      add_header Cache-Control "public, max-age=31536000";
      # Additional Nginx settings can go here
  }
}