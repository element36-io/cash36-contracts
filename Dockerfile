# node:alpine will be our base image to create this image
FROM ubuntu:16.04

RUN apt-get update
RUN apt-get install -y curl git make g++
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install -y yarn

COPY . /app

WORKDIR /app

RUN yarn

EXPOSE 8545

COPY ./start.sh ./
RUN ["chmod", "+x", "./start.sh"]

CMD ["./start.sh"]
