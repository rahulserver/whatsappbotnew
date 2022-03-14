use "listgroups" to your  own number for listing groups in "bot.json"

make sure to restart software after above step.

forward message to your own number to make it go to all groups listed in bot.json 

currently you need to install the click to send software https://play.google.com/store/apps/details?id=com.trianguloy.openInWhatsapp to send message to your own number.

note that "self" is the mobile number that is being used with whatsapp web. YOU NO LONGER NEED THE "self" and "masterId" in bot.json for current version. Leave those fields like that for possible future versions.

if software stops working, then goto this link: https://www.npmjs.com/package/whatsapp-web.js and find its version number. And update it in package.json
e.g. if latest version number is 1.16.5 from the site, then simply find this line in package.json


`"whatsapp-web.js": "^1.16.4"` and replace whatever comes after this symbol`^` (in this case 1.16.4)
so now above line would look like:
`"whatsapp-web.js": "^1.16.5"`

Then delete the node_modules/ folder and run the runApp.bat again
