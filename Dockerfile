FROM archlinux

RUN mkdir /typings
WORKDIR /typings
RUN pacman -Syyu --noconfirm
RUN pacman -S --noconfirm nginx nodejs
COPY . .
RUN npm install
ENTRYPOINT ["node", "start.js"]
