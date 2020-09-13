# Dash

A Zoom-like video chat based on WebRTC using STUN/TURN servers

## Features

* Peer-to-Peer, no central server required
* Application Extensibility through APIs
* Hand gesture recognition using Tensorflow Handpose
  * Current Implementation includes raising hands to notify everyone on the stream
* Ability to run one's own STUN/TURN servers
* Minimal UI

## Setting up

### Docker

You can use the provided docker-compose to deploy the entire stack:

```shell
$ cd docker/
$ docker-compose up --build -d
```

If you'd like to run the application in development mode, use `docker-compose.dev.yml` instead:

```shell
$ cd docker/
$ docker-compose -f docker-compose.dev.yml up --build -d
```

### Configuration

For caddy to work, the setup assumes that you will be running the application on a FQDN. You need to edit the `Caddyfile` to point to your own server, and change `your.fqdn` to the domain where the application will be hosted.

In case you'd like to run the application locally using docker, change `your.fqdn` to `localhost:<port>`.

## Using the Application

TODO

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

