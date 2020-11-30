const {Client} = require('whatsapp-web.js');
const fs = require("fs");
const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({puppeteer: {headless: false}, session: sessionCfg});
client.initialize();
start(client);

async function start(client) {
  let bot = require("./bot.json");
  client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
  });

  client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
      if (err) {
        console.error(err);
      }
    });
  });
  client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
  });

  client.on('ready', () => {
    console.log('READY');
  });

  client.on('message_create', async message => {
    if (message.fromMe && client.info.wid._serialized==message.to) {
      if (message.isForwarded) {
        bot = require("./bot.json");
        let recipients = Object.keys(bot["recipients"]);
        let errorIds = [];
        for (let i = 0; i < recipients.length; i++) {
          let recipient = recipients[i];
          console.log("Attempting to send message to ", recipient);
          try {
            await message.forward(recipient);
            console.log("Success!");
          } catch (e) {
            errorIds.push(recipient);
            console.log("Error occurred sending message to recipient ", recipient, e);
          }
          console.log("now sleeping");
          await new Promise(r => setTimeout(r, (bot.sleepSec || 5) * 1000));
        }
        console.log("done");
        console.log("errorIds", errorIds);
      }
      if (message.body.toLowerCase() === "listgroups" ) {
        let groups = await client.getChats();
        groups=groups.filter(it=>(it.id.server=="g.us" || it.id.server=="broadcast"));
        let groupObj = {};
        groups.forEach(group => {
          groupObj[`${group.id.user}@${group.id.server}`] = group.name;
        });
        console.log(`Writing ${groups.length} groups to bot.json recipients`);
        writeBackToJsonFile("./bot.json", "recipients", groupObj);
        console.log("Success!");
      }
    }
  });
}

function writeBackToJsonFile(fileName, key, value) {
  // read the file
  let json = require(fileName);
  json[key] = value;
  fs.writeFileSync(fileName, JSON.stringify(json, null, "\t"));
}
