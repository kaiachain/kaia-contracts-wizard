
FROM node:16
# working directory
WORKDIR /usr/src/app
# copying project to the working directory
COPY . .
# installing dependencies
RUN npm install
# building project
RUN npm run build
# exposing port
EXPOSE 8080

# command to run container
CMD [ "npm", "run", "start"]
