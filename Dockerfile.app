FROM node:18 as development

# Install development dependencies
WORKDIR /usr/src/app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install

# Build application
COPY . .
RUN yarn build:app

# Configure application startup command
CMD ["npm", "run", "start"]

FROM node:18 as pre-production
# Install runtime dependencies
WORKDIR /usr/src/app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --only=production

FROM node:18-alpine as production

# Setup default environment variables
ENV NODE_ENV production
# Copy runtime dependencies and application code
WORKDIR /usr/src/app
COPY --from=pre-production /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/dist ./dist
#COPY --from=development /usr/src/app/apps/api/config/.env /dist/apps/api/.env
RUN touch /usr/src/app/dist/apps/api/.env

# Configure application startup command
ENTRYPOINT ["node"]
CMD ["dist/apps/api/src/main"]
