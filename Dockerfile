# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Accept the secret as a build argument
ARG VITE_CALENDAR_SECRET
ENV VITE_CALENDAR_SECRET=$VITE_CALENDAR_SECRET

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage — lightweight nginx server
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
