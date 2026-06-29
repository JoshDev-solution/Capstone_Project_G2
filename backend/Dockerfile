# Multi-stage build for Node.js Backend
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy backend source
COPY ./ ./

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript code
RUN npm run build

# Use runtime image
FROM node:20-alpine AS runtime
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy generated Prisma Client and built application
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/dist ./dist

# Copy prisma schema for migrations if needed at runtime
COPY prisma ./prisma

# Set environment
ENV NODE_ENV=production

# Start the application by running the db-push script first, then the server
CMD ["sh", "-c", "node prisma/db-push.js && node dist/server.js"]
