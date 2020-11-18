const wa = require('@open-wa/wa-automate');
const fs = require("fs");
wa.create({
  headless: false
}).then(client => start(client));

async function start(client) {
  let bot = require("./bot.json");
  // console.log("bot", bot);
  // fs.writeFileSync("bot.json", JSON.stringify({"foo": "bar"}));
  client.onMessage(async message => {
    console.log("message", message);
    if (message.from === bot.masterId && message.to === bot.self) {
      if (message.isForwarded) {
        bot = require("./bot.json");
        let recipients = Object.keys(bot["recipients"]);
        let errorIds = [];
        for (let i = 0; i < recipients.length; i++) {
          let recipient = recipients[i];
          console.log("Attempting to send message to ", recipient);
          try {
            await client.forwardMessages(recipient, message.id, true);
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
      if (message.body.toLowerCase() === "listgroups") {
        let groups = await client.getAllGroups();
        console.log("groups", groups);
        let groupObj = {};
        groups.forEach(group => {
          groupObj[group.id] = group.name;
        });

        let chats = await client.getAllChats();
        chats.forEach(chat => {
          if (chat.kind === "broadcast") {
            groupObj[chat.id] = chat.formattedTitle
          }
        });
        writeBackToJsonFile("./bot.json", "recipients", groupObj);
      }

      if (message.body.toLowerCase() === "testbroad") {
        await client.sendText("1605685425@broadcast", "test broadcast message");
      }

    }
  });
}

function writeBackToJsonFile(fileName, key, value) {
  // read the file
  let json = require(fileName);
  json[key] = value;
  fs.writeFileSync(fileName, JSON.stringify(json));
}
