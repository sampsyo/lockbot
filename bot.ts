import * as libweb from './libweb';
import * as http from 'http';

const PORT = 8323;

let routes = [
  new libweb.Route('/lock', async (req, res, params) => {
    console.log("lock");
  }),
];

let server = http.createServer(libweb.dispatch(routes));
server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
