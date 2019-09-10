# node:alpine will be our base image to create this image
FROM node:alpine
# Set the /app directory as working directory
WORKDIR /app
# Install ganache-cli globally
RUN apk add --no-cache --virtual .gyp \
  python \
  make \
  g++ \
  && npm install -g ganache-cli \
  && apk del .gyp

RUN mkdir data
COPY ./data /app/data

EXPOSE 8545

# Set the default command for the image
CMD ["ganache-cli", "-d", "-i 85458545", "-b 5", "-h", "0.0.0.0", "--db=/app/data", "--account='25069382916411623863207185039257794071373462504371777120534633665548836818875,100000000000000000000'", "--account='85340004243906443092976946211703212967229377844852092368249957957536976411657,100000000000000000000'"]
