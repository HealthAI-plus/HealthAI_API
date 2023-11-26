FROM node:20.9.0-alpine3.17
WORKDIR /usr/klusapi
COPY ./package.json .
RUN npm install
COPY ./ .
EXPOSE 5000
CMD ["npm", "run", "dev"]