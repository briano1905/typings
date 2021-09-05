FROM archlinux

RUN mkdir /typings
WORKDIR /typings
RUN pacman -Syyu --noconfirm
RUN pacman -S --noconfirm nodejs npm
COPY . .
RUN npm install
ENTRYPOINT ["node", "start.js"]
