const Discord = require('discord.js');
const client = new Discord.Client();

var helper = require('./scripts/helper');
var randomTeams = require('./scripts/randomTeams');

var _prefix;

helper.readModuleFile('../preferences.json', (err, content) => {
  let preferences = JSON.parse(content);
  _prefix = "prefix" in preferences ? preferences.prefix : "!";
});

helper.readModuleFile('../bot_token', (err, bot_token) => {
  client.login(bot_token);
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Message evaluation
client.on('message', message => {
  let text = message.content;
  if (text.indexOf(_prefix + "teams") == 0) {
    randomTeams(client, message);
  }
});
