# STAGE 1: The Build Environment
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the React code and build the production files
COPY . .
# Note: If using standard Create-React-App, this outputs to a /build folder. 
# If using Vite, this outputs to a /dist folder. We'll assume Vite/dist here.
RUN npm run build 

# STAGE 2: The Production Server
FROM nginx:alpine

# Copy ONLY the compiled static files from Stage 1 into the Nginx container
COPY --from=builder /app/dist /usr/share/nginx/html

# Document that Nginx serves on port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]