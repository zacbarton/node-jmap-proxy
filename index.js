'use strict';

const cors = require('cors');
const express = require('express');
const request = require('request');
const sse = require('server-sent-events');
const bodyParser = require('body-parser');
const EventSource = require('eventsource');

// Set API endpoints.
const JMAP_PROXY_URL = process.env.JMAP_PROXY_URL || '';
const API_URL = JMAP_PROXY_URL;
const UPLOAD_URL = JMAP_PROXY_URL.replace(/\/jmap\//, '/upload/');
const DOWNLOAD_URL = JMAP_PROXY_URL.replace(/\/jmap\//, '/raw/') + '/{blobId}/{name}';
const EVENTSOURCE_URL = JMAP_PROXY_URL.replace(/\/jmap\//, '/events/');

// Our proxy config.
const PORT = process.env.NODE_PORT || 5000;
const HOST = process.env.NODE_HOST || 'localhost';
const LOCAL_PROXY_URL = `http://${HOST}:${PORT}`;
const LOCAL_EVENTSOURCE_URL = `${LOCAL_PROXY_URL}/events`;

// Check the JMAP URL is valid.
if (!JMAP_PROXY_URL.startsWith('https://proxy.jmap.io/jmap/')) {
  console.error(`Sorry that doesnt look like a valid JAMP Proxy URL. Expecting https://proxy.jmap.io/jmap/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/`);
  process.exit(0);
}

// Lets go...
const app = express();
app.use(cors());

// Test endpoint that fetches mailboxes.
app.get('/test', (req, res) => {
  request.post(API_URL, { body: [['getMailboxes', {}, '#0']], json: true }, (err, response, body) => {
      console.log(API_URL)
    res.send(`<pre>${JSON.stringify(body, null, 2)}</pre>`);
  });
});

// Auth service autodiscovery.
app.head('/.well-known/jmap', (req, res) => {
  res.status(301);
  res.header('Location', `${LOCAL_PROXY_URL}/auth`);
  res.end();
});

// Stubbed Authentication endpoint.
// :IMPORTANT: always successful.
app.all('/auth', bodyParser.json(), (req, res) => {
  const randomToken = Math.random().toString(36).substr(2, 20);
  let payload;

  if (req.body.username) {
    payload = {
      continuationToken: randomToken,
      methods: ['password'],
      prompt: null,
    };
  } else {
    payload = {
      accessToken: randomToken,
      apiUrl: API_URL,
      uploadUrl: UPLOAD_URL,
      downloadUrl: DOWNLOAD_URL,
      eventSourceUrl: LOCAL_EVENTSOURCE_URL,
    };
  }

  res.json(payload);
});

// Proxied EventSource.
app.get('/events', sse, (req, res) => {
  const eventSource = new EventSource(EVENTSOURCE_URL);

  eventSource.onopen = () => {
    console.log(`EventSource proxying ${EVENTSOURCE_URL}`);
  }
  eventSource.onerror = (err) => {
    console.error('EventSource error', err);
  }

  eventSource.addEventListener('state', event => {
    res.sse(`event: ${event.type}\n`)
    res.sse(`data: ${event.data}\n\n`);
  });
});

// Start server.
app.listen(PORT, () => {
  console.log(`JMAP Proxy listening on ${LOCAL_PROXY_URL}`);
});
