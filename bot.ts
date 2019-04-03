import * as libweb from './libweb';
import * as http from 'http';

const PORT = 8323;

function send(res: http.OutgoingMessage, data: any) {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// Map channel IDs to user IDs to locked things.
let locks = new Map<string, Map<string, string>>();

function getLocks(chanId: string) {
  let out = locks.get(chanId);
  if (out) {
    return out;
  }
  let nout = new Map<string, string>();
  locks.set(chanId, nout);
  return nout;
}

function listLocks(chanLocks: Map<string, string>) {
  let out: string[] = [];
  for (let [thing, userId] of chanLocks) {
    out.push(`<@${userId}> :lock2: ${thing}`);
  }
  return out.join('; ');
}

let routes = [
  new libweb.Route('/lock', async (req, res, params) => {
    let data = await libweb.formdata(req);

    let thing = data.text as string;
    let chanId = data.channel_id as string;
    let userId = data.user_id as string;

    console.log(`${data.user_name} (${userId}) acquired ` +
      `${thing} in ${chanId}`);
    let l = getLocks(chanId);
    l.set(thing, userId);

    send(res, {
      response_type: 'in_channel',
      text: listLocks(l),
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
