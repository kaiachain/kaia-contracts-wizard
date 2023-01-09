
FROM node:16
# working directory
WORKDIR /usr/src/app
# copying project to the working directory
COPY . .
# installing dependencies
RUN yarn install
# building project
RUN yarn run build
# exposing port
EXPOSE 8080

# command to run container
CMD [ "yarn", "run", "start"]
