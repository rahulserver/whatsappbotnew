To run this file, install nodejs from here: https://nodejs.org/en/download/ 

Then run this software using double click on runApp.bat

message "listgroups" to your  own number for listing groups in "bot.json"

make sure to restart software after above step.

forward message to your own number to make it go to all groups listed in bot.json 

currently you might need to install the click to send software https://play.google.com/store/apps/details?id=com.trianguloy.openInWhatsapp to send message to your own number.
or use https://wa.me/918833223312 (or whatever is your number with country prefix)

if software stops working, then goto this link: https://www.npmjs.com/package/whatsapp-web.js and find its version number. And update it in package.json
e.g. if latest version number is 1.16.5 from the site, then simply find this line in package.json


`"whatsapp-web.js": "^1.16.4"` and replace whatever comes after this symbol`^` (in this case 1.16.4)
so now above line would look like:
`"whatsapp-web.js": "^1.16.5"`

Then delete the node_modules/ folder and run the runApp.bat again
