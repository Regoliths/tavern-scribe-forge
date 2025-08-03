# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4ebcae8c-e4ed-4e81-85b1-40a55cb17317

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4ebcae8c-e4ed-4e81-85b1-40a55cb17317) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4ebcae8c-e4ed-4e81-85b1-40a55cb17317) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Deployment with Nginx

Your React application uses client-side routing. This means if you navigate to a page like `/my-character` and hit refresh, the browser will ask the server for that specific path. Nginx will return a 404 error by default because that file doesn't exist on the server.

to fix this, you must tell Nginx to serve `index.html` for any route it can't find. Create a new file named `nginx.conf` in the root of your project with the following content.

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