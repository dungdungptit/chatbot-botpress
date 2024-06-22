FROM node:12.18.1
WORKDIR /
COPY . .
RUN npm i yarn typescript --global --force
RUN yarn install --force
RUN yarn cache clean
RUN yarn run build
EXPOSE 3000
CMD ["yarn", "run", "start"]
