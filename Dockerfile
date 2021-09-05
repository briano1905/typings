FROM archlinux

RUN mkdir /typings
WORKDIR /typings
RUN pacman -Syyu --noconfirm
RUN pacman -S --noconfirm nginx nodejs
COPY . .
ENTRYPOINT ["node", "start.js"]
