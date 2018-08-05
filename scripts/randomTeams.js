module.exports = randomTeams;

var helper = require('./helper');

const DATA_FILE = "../storage/randomTeams.json";

/**
 * Using `!teams create {channel name} {number of teams}`, take the active users in the given voice channel
 * and split them evenly as possible into the specified number of teams.
 * 
 * @param {Discord.Client()} client is the Discord client.
 * @param {String} message is the Discord `message` object.
 */
function randomTeams(client, message) {
  let messageArray = message.content.split(" ");
  messageArray.splice(0,1); // Remove triggering command

  let subCommand = messageArray.splice(0, 1);
  if (subCommand == "create") {
    createRandomTeamsFromChannel(client, message, messageArray);
  } else if (subCommand == "channels") {
    setChannelsAvailableForMove(client, message, messageArray);
  } else if(subCommand == "move") {
    moveUsersIntoChannels(client, message);
  } else if(subCommand == "return") {
    returnUsersToFirstChannel(client, message);
  } else {
    message.reply("Available sub commands for `!teams` are `create`, `channels`, `move`, and `return`.\n" +
                  "```\n" +
                  "!teams create {channel name} {# of teams}\n" +
                  "!teams channels {channel names...}\n" +
                  "!teams move\n" +
                  "!teams return\n" +
                  "```");
  }
}

/**
 * Using `!teams create {channel name} {number of teams}`, take the active users in the given voice channel
 * and split them evenly as possible into the specified number of teams.
 * 
 * @param {Discord.Client()} client is the Discord client.
 * @param {Discord.Message} message is the discord message object.
 * @param {Array} arguments is the array of arguments from the message.
 */
function createRandomTeamsFromChannel(client, message, arguments) {
  let voiceChannelName = arguments[0];
  let numTeams = parseInt(arguments[1], 10);
  let selectedChannel = client.channels.find("name", voiceChannelName);

  // Initial validation
  if (arguments.length != 2 || isNaN(numTeams)) {
    message.reply("The correct format is:\n" +
              "`!teams create {channel name} {# of teams}`");
    return;
  } else if (numTeams < 1) {
    message.reply("You cannot have fewer than 1 team.");
    return;
  } else if (selectedChannel == null) {
    message.reply("Channel with name " + voiceChannelName + " is not found.");
    return;
  } else if (selectedChannel.type != "voice") {
    message.reply("Only voice channels are supported. " + voiceChannelName + " is a `" + selectedChannel.type + "` channel");
    return;
  }
  
  let currentUsers = selectedChannel.members.map(e => ({"id": e.user.id, "name": e.user.username}));
  
  // Verify there would be no empty teams
  let currentUsersLength = currentUsers.length;
  if (currentUsersLength < numTeams) {
    message.reply("Only " + currentUsersLength + " members in channel " + voiceChannelName + ". Please request " + currentUsersLength + " or fewer teams.");
    return;
  }

  helper.shuffle(currentUsers);
  let mixedTeams = helper.chunkify(currentUsers, numTeams, true);
  
  // Store the new team data
  helper.readModuleFile(DATA_FILE, (err, content) => {
    let data = JSON.parse(content);
    data["teams"] = mixedTeams;

    helper.writeModuleFile(DATA_FILE, JSON.stringify(data, null, 4), (err) => {
      if (err) console.error(err);
    });
  });
  
  // Generate output message
  outputMessage = "\n";
  for (let i = 0; i < numTeams; i++) {
    outputMessage += "**__Team #" + (i + 1) + "__**\n";
    mixedTeams[i].forEach(user => {
      outputMessage += user.name + "\n"
    })
    outputMessage += "\n";
  }

  message.reply(outputMessage);
  return;
}

/**
 * Using `!teams channels {channel names...}`, set channels that will be available to the `move` sub-command.
 * 
 * @param {Discord.Client()} client is the Discord client.
 * @param {Discord.Message} message is the discord message object.
 * @param {Array} arguments is the array of arguments from the message.
 */
function setChannelsAvailableForMove(client, message, channelNames) {
  let badChannels = [];
  let channels = [];
  
  // Validate and collect channels
  channelNames.forEach(channelName => {
    let channel = client.channels.find("name", channelName);
    if (channel == null || (channel != null && channel.type != "voice")) {
      badChannels.push(channelName);
    } else {
      channels.push({"id": channel.id, "name": channel.name});
    }
  });

  if (badChannels.length > 0) {
    message.reply("There was a problem with the channel(s) requested. Check spelling and ensure you are only listing voice channels.\n" +
                  "```" + badChannels.toString() + "```");
    return;
  }

  helper.readModuleFile(DATA_FILE, (err, content) => {
    let data = JSON.parse(content);
    data["channels"] = channels;

    helper.writeModuleFile(DATA_FILE, JSON.stringify(data, null, 4), (err) => {
      if (err) console.error(err);
      message.reply("Channels available for teams has been set: `[" + channelNames.toString() + "]`");
    });
  });
}

/**
 * Using `!teams move`, take users in each team (created by the `create` sub-command) and move them into
 * available channels (defined by the `channels` sub-command).
 * 
 * @param {Discord.Client()} client is the Discord client.
 * @param {Discord.Message} message is the discord message object.
 */
function moveUsersIntoChannels(client, message) {
  let guildId = message.channel.guild.id;
  
  helper.readModuleFile(DATA_FILE, (err, content) => {
    let data = JSON.parse(content);
    let channels = data["channels"];
    let teams = data["teams"];

    if (!validateTeamsAndChannels(message, teams, channels)) {
      return;
    }

    if (teams.length > channels.length) {
      message.reply("Not enough channels specified to move users into teams. " + teams.length + " teams, " + channels.length + " channel(s).\n" +
                    "Current available channels are: `" + channels.map(e => e.name).toString() + "`.\n" +
                    "Use `!teams channels {channel names...}` to set available voice channels.");
      return;
    }

    for (let i = 0; i < teams.length; i++) {
      let channel = client.channels.find("id", channels[i].id);

      teams[i].forEach(user => {
        let member = client.guilds.get(guildId).members.find("id", user.id);
        member.setVoiceChannel(channel);
      });
    }
  });
}

/**
 * Using `!teams return`, take all users from all team (created by the `create` sub-command) and move them into
 * the first channel defined (by the `channels` sub-command).
 * 
 * @param {Discord.Client()} client is the Discord client.
 * @param {Discord.Message} message is the discord message object.
 */
function returnUsersToFirstChannel(client, message) {
  let guildId = message.channel.guild.id;
  
  helper.readModuleFile(DATA_FILE, (err, content) => {
    let data = JSON.parse(content);
    let channels = data["channels"];
    let teams = data["teams"];

    if (!validateTeamsAndChannels(message, teams, channels)) {
      return;
    }

    let channel = client.channels.find("id", channels[0].id);

    teams.forEach(team => {
      team.forEach(user => {
        let member = client.guilds.get(guildId).members.find("id", user.id);
        member.setVoiceChannel(channel);
      });
    });
  });
}

/**
 * Checks required data has been set/stored. Returns `true` if arrays are valid and `false` if either is missing.
 * 
 * @param {Array} teams is the array of teams.
 * @param {Array} channels is the array of channels.
 */
function validateTeamsAndChannels(message, teams, channels) {
  let errorResponse = [];

  if (!Array.isArray(teams) || !teams.length) {
    errorResponse.push("Teams have not been set. Use `!teams create {channel name} {# of teams}`.\n");
  }
  if (!Array.isArray(channels) || !channels.length) {
    errorResponse.push("Channels have not been set. Use `!teams channels {channel names...}`.\n")
  }

  if (errorResponse.length > 0) {
    message.reply(errorResponse.join(""));
    return false;
  }

  return true;
}
