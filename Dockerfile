# node:alpine will be our base image to create this image
FROM trufflesuite/ganache-cli

# Set the /app directory as working directory

WORKDIR /app
RUN mkdir data
COPY ./data /app/data
EXPOSE 8545
# Set the default command for the image
CMD ["ganache-cli", "-d", "-i 85458545", "-b 5", "-h", "0.0.0.0", "--db=/app/data", "-a 10"]
