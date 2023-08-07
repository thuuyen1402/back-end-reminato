# Stage 1
FROM  node:16.13.1 AS installation

WORKDIR /base

COPY ./package.json /base/package.json
COPY . /base
RUN npm install



# Stage 2
FROM installation AS setupdb
RUN npm run prisma:generate

# Stage 3
FROM setupdb AS operation
HEALTHCHECK --interval=30s \
  CMD node healthcheck.js

