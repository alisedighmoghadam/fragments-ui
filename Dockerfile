# Stage 1: Build the Next.js static site
FROM node:18-alpine AS builder

WORKDIR /app

# Accept build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AWS_COGNITO_POOL_ID
ARG NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID
ARG NEXT_PUBLIC_OAUTH_SIGN_IN_REDIRECT_URL

# Set them as ENV for use in build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_AWS_COGNITO_POOL_ID=$NEXT_PUBLIC_AWS_COGNITO_POOL_ID
ENV NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID=$NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID
ENV NEXT_PUBLIC_OAUTH_SIGN_IN_REDIRECT_URL=$NEXT_PUBLIC_OAUTH_SIGN_IN_REDIRECT_URL

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy all files
COPY . .

# Build the static site (requires output: 'export' in next.config.js)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS runner

# Clean default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy static site to Nginx's web root
COPY --from=builder /app/out /usr/share/nginx/html

# Expose default Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
