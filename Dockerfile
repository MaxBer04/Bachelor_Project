FROM node:10
WORKDIR /
ENV PATH_WITH_SPACE "home/max/Dropbox/COMP UNI/BachelorArbeit/Sketches/Bachelor_Project"
ADD ./ ${PATH_WITH_SPACE}
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./


RUN npm clean-install
COPY . ./
# If you are building your code for production
# RUN npm ci --only=production
RUN npm run build
COPY . .


EXPOSE 3000

CMD [ "node", "dist/app.js" ]