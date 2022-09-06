## Stage 1. Compile TS sources to JS
FROM node:lts as builder
# Set build directory
WORKDIR /usr/src/app
# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY ./package*.json ./*.lock ./tsconfig.json ./tsconfig.build.json ./nest-cli.json ./

# Install dev dependencies
RUN yarn install --frozen-lockfile --dev

# Copy sources
COPY ./apps/finfrac-worker ./apps/finfrac-worker
COPY ./config ./config
COPY ./libs ./libs
COPY ./templates ./templates
# Build appZS
RUN yarn run build:worker

## Stage 2. Run built app
# Note: node:12-alpine could not be used here due to weak bcrypt support:
# https://github.com/kelektiv/node.bcrypt.js/wiki/Installation-Instructions#alpine-linux-based-images
FROM node:lts

# Set app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /usr/src/app/templates ./templates
COPY --from=builder /usr/src/app/dist/apps/finfrac-worker ./dist

EXPOSE 7000

CMD ["node", "dist/main"]
