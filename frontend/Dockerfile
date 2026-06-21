# Stage 1: Build React/Vite App
FROM node:20-alpine AS build
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
# Use --legacy-peer-deps to avoid conflict with vite-plugin-pwa in Vite 6
RUN npm ci --legacy-peer-deps

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx (Alpine)
FROM nginx:alpine
EXPOSE 80

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build output from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx runs automatically
CMD ["nginx", "-g", "daemon off;"]
