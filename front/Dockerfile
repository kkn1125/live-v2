FROM ubuntu:22.04

RUN apt update -y
RUN apt install curl vim lsof -y

RUN curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
ENV NODE_VERSION=18.14.0
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

RUN npm i -g npm@latest
RUN npm i -g cross-env nodemon dotenv serve

RUN mkdir -p /home/ubuntu/live_ander/front

WORKDIR /home/ubuntu/live_ander/front

COPY . .

RUN npm i

RUN npm run build

# hosts db ip 추가
# RUN sudo echo 172.17.0.3      mariadb >> /etc/hosts

# CMD ["npm", "run", "start"]

# ENTRYPOINT [ "nohup", "npm", "run", "aws", "&" ]