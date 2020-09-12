
# Dash

lightning fast p2p video chat with gesture recognition

- server
  - apis
    - rooms
    - participants
    - set username
  - help establish initial connection for key exchange and stuff
  - have stun and turn server
    - https://github.com/coturn/coturn/
  - limit to 1v1 communication initially

- browser client
  - minimal ui
  - hand gesture recognition
  - send recog to peers
  - take action based on recog

- test out and host on domain
- 404 on favicon.ico


## Architecture

- Routing done via nginx

- `/`
  - landing page
  - list of connected members
- `/api`
  - createroom
  - joinroom


## Idea Credits

- [@mpj](https://twitter.com/mpjme), [talking about it](https://youtu.be/6To3Rt4w3ys?t=324) on [Fun Fun Function](https://www.youtube.com/c/funfunfunction)


## LICENSE

This repository has been released under the [GNU Affero General Public License v3.0](LICENSE.txt)

```
dash - a p2p chat platform, built on webrtc with gesture recognition
Copyright (C) <2020>  <"Ameya Shenoy" <shenoy.ameya@gmail.com>>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

