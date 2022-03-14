const {Client, LocalAuth} = require('whatsapp-web.js');
const fs = require("fs");
const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "client-one"}),
  puppeteer: {
    headless: false
  },
});

client.initialize();
start(client);

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

async function start(client) {
  let bot = require("./bot.json");
  let min = bot.sleepSecMin
  let max = bot.sleepSecMax
  if (isNaN(min) || isNaN(max)) {
    throw new Error('sleepSecMin and sleepSecMax should both be valid numbers')
  }

  if (max < min) {
    throw new Error('sleepSecMin should be less than sleepSecMax')
  }

  if (max - min < 5) {
    throw new Error('sleepSecMax and sleepSecMax should differ by atleast 5')
  }

  client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
  });

  // client.on('authenticated', (session) => {
  //   console.log('AUTHENTICATED', session);
  //   sessionCfg = session;
  //   fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
  //     if (err) {
  //       console.error(err);
  //     }
  //   });
  // });
  client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
  });

  client.on('ready', () => {
    console.log('READY');
  });

  client.on('message_create', async message => {
    if (message.fromMe && client.info.wid._serialized == message.to) {
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
          let rand = randomIntFromInterval(min, max)
          console.log("now sleeping for " + rand + " seconds");
          await new Promise(r => setTimeout(r, (rand) * 1000));
        }
        console.log("done");
        console.log("errorIds", errorIds);
      }
      if (message.body.toLowerCase() === "listgroups") {
        let groups = await client.getChats();
        groups = groups.filter(it => (it.id.server == "g.us" || it.id.server == "broadcast"));
        let groupObj = {};
        groups.forEach(group => {
          groupObj[`${group.id.user}@${group.id.server}`] = group.name;
        });
        console.log(`Writing ${groups.length} groups to bot.json recipients`);
        await message.reply(`Writing ${groups.length} groups to bot.json recipients`);
        writeBackToJsonFile("./bot.json", "recipients", groupObj);
        console.log("Success!");
        await message.reply('Successfully written '+groups.length+' groups to bot.json');
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
