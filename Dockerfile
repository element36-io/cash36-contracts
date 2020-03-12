# node:alpine will be our base image to create this image
FROM trufflesuite/ganache-cli

# Set the /app directory as working directory

WORKDIR /app
RUN ls
RUN mkdir data
COPY ./data /app/data
EXPOSE 8545
# Set the default command for the image
# CMD ["ganache-cli", "-i 85458545", "--db=/app/data"]
CMD ["ganache-cli", "-i 85458545", "--db=/app/data", "--account=0x3a97f566dbec6f561c7c19bee0ddc0cabc64de77c3f804b4e7a289aea2d125e3,101000000000000000000000", \
 "--account=0x3691a753f1162ebf5326b593163ae1ffe60c838529e5fe8d30ceba75ba58d857,202000000000000000000000", \
 "--account=0xcf6079764ce1ae48ffe0f5e7b5e058475e0c31252db0585f7cb9d27a1e197f60,303000000000000000000000", \
 "--account=0x14b57a36730cd028219fc45d049cb2d432ef922aa07d8bc83a607328b4ed464e,404000000000000000000000", \
 "--account=0x07a169ea5ff0a947f22ae87a5480a3be05cee338729c0af87b87c444fb8c27b4,505000000000000000000000"]