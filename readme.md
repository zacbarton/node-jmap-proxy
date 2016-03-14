# JMAP Proxy Server

A wrapper around the official JMAP Proxy (https://proxy.jmap.io) that exposes a stubbed Authentication endpoint (well-known) and Event Source with CORS support.


### Install

```
$ npm install jmap-proxy
```


### Running

```
$ JMAP_PROXY_URL=https://proxy.jmap.io/jmap/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx npm start
```
Note: substitute JMAP_PROXY_URL for the full URL provided by [https://proxy.jmap.io](https://proxy.jmap.io).

You can then use http://localhost:5000 in your JMAP client.


### Debugging

You can test the proxy by going to [http://localhost:5000/test](http://localhost:5000/test).


### JMAP documentation

Can be found at [http://jmap.io/spec.html](http://jmap.io/spec.html).
