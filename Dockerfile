# ---------- Build Stage ----------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies separately for better caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY . .

# Build the app (requires vite, included in devDeps)
RUN npm run build


# ---------- Production Stage ----------
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add your custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Copy specific PWA-related files
COPY --from=builder /app/public/manifest.json /usr/share/nginx/html/
COPY --from=builder /app/public/sw.js /usr/share/nginx/html/

# Expose frontend port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
