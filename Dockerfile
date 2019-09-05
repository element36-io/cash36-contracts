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
# Set the default command for the image
CMD ["ganache-cli", "-i 85458545", "-h", "0.0.0.0"]
