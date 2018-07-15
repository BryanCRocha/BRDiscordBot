const Discord = require('discord.js');
const client = new Discord.Client();

var helper = require('./scripts/helper');
var splitChannelIntoNumberOfTeams = require('./scripts/splitChannelIntoNumberOfTeams');

helper.readModuleFile('../bot_token', function (err, bot_token) {
  client.login(bot_token);
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Message evaluation
client.on('message', message => {
  let text = message.content;
  if (text.indexOf("!teams") == 0) {
    splitChannelIntoNumberOfTeams(client, message);
  }
});
