FROM node:20.11-alpine
WORKDIR /app

ARG APP
ENV PORT=3000

COPY ./dist/apps/${APP} .

# Since we are using npm, install dependencies using npm
RUN npm install --omit=dev --legacy-peer-deps
RUN npm install @nestjs/platform-express pg --legacy-peer-deps

EXPOSE ${PORT}

CMD ["node", "main.js"]
