const http = require('http');
const httpProxy = require('http-proxy');
const connect = require('connect');
const transformerProxy = require('transformer-proxy');

const CONFIG = {
    PORT: 80, // Port for the VPS proxy server
    TARGET_PROXY_IP: '192.168.0.106', // Replace with the IP of your proxy server
    TARGET_PROXY_PORT: 8080, // Replace with the port your proxy server is running on
    RESPONSE_HEADERS: [
        { name: 'X-Secret-Header', value: null }, // null => remove header
    ],
};

const proxy = httpProxy.createProxyServer({});
proxy.on('proxyReq', (proxyReq, req, res, options) => {
    for (let header of CONFIG.RESPONSE_HEADERS) {
        if (header.value === null) proxyReq.removeHeader(header.name);
        else proxyReq.setHeader(header.name, header.value);
    }
});

const app = connect();
app.use(transformerProxy(i => i, { headers: CONFIG.RESPONSE_HEADERS }));
app.use((req, res) => {
    proxy.web(req, res, {
        target: `http://${CONFIG.TARGET_PROXY_IP}:${CONFIG.TARGET_PROXY_PORT}`,
    });
});

const server = http.createServer(app);
server.listen(CONFIG.PORT, () => {
    console.log(`VPS proxy server listening on port ${CONFIG.PORT}`);
});
