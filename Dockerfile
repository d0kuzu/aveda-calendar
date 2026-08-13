# Build stage
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_CALENDAR_SECRET
ENV VITE_CALENDAR_SECRET=$VITE_CALENDAR_SECRET

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage — lightweight static file server
FROM node:20-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "dist", "-l", "3000"]
