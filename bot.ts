import * as libweb from './libweb';
import * as http from 'http';

const PORT = 8323;

function send(res: http.OutgoingMessage, data: any) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

let routes = [
  new libweb.Route('/lock', async (req, res, params) => {
    let data = await libweb.formdata(req);
    console.log(`${data.user_name} (${data.user_id}) acquired ` +
      `${data.text} in ${data.channel_id}`);
    send(res, {
      response_type: 'in_channel',
      text: `${data.user_name} :lock2: ${data.text}`,
    });
  }),
  new libweb.Route('/unlock', async (req, res, params) => {
    console.log("unlock");
    res.end(JSON.stringify({'foo': 'hi'}));
  }),
];

let server = http.createServer(libweb.dispatch(routes));
server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
