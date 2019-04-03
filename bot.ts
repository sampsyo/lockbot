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

async function reqData(req: http.IncomingMessage) {
  let data = await libweb.formdata(req);

  return {
    thing: data.text as string,
    chanId: data.channel_id as string,
    userId: data.user_id as string,
    userName: data.user_name as string,
  };
}

let routes = [
  new libweb.Route('/lock', async (req, res, params) => {
    let d = await reqData(req);
    console.log(`${d.userName} (${d.userId}) acquired ` +
      `${d.thing} in ${d.chanId}`);

    let l = getLocks(d.chanId);
    l.set(d.thing, d.userId);

    send(res, {
      response_type: 'in_channel',
      text: listLocks(l),
    });
  }),
  new libweb.Route('/unlock', async (req, res, params) => {
    let d = await reqData(req);
    console.log(`${d.userName} (${d.userId}) released ` +
      `${d.thing} in ${d.chanId}`);

    let l = getLocks(d.chanId);
    if (l.get(d.thing) === d.userId) {
      l.delete(d.thing);
      send(res, {
        response_type: 'in_channel',
        text: listLocks(l),
      });
    } else {
      send(res, {
        response_type: 'ephemeral',
        text: `you do not hold ${d.thing}: ` + listLocks(l),
      });
    }
  }),
];

let server = http.createServer(libweb.dispatch(routes));
server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
