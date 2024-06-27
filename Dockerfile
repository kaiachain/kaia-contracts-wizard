
FROM node:18
# working directory
WORKDIR /usr/src/app
# copying project to the working directory
COPY . .
# installing dependencies
RUN npm install
# exposing port
EXPOSE 8080

# command to run container
CMD [ "npm", "run", "start"]
