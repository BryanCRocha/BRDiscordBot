module.exports = splitChannelIntoNumberOfTeams;

var helper = require('./helper');

/**
 * Using `!teams {channel name} {number of teams}`, take the active users in the given voice channel
 * and split them evenly as possible into the specified number of teams.
 * 
 * @param {Discord.Client()} client is the Discord client.
 * @param {String} message is the Discord `message` object.
 */
function splitChannelIntoNumberOfTeams(client, message) {
    let messageArray = message.content.split(" ");
    let voiceChannelName = messageArray[1];
    let numTeams = parseInt(messageArray[2], 10);
    let selectedChannel = client.channels.find("name", voiceChannelName);
  
    // Initial validation
    if (messageArray.length != 3 || isNaN(numTeams)) {
      message.reply("The correct format is:\n" +
                "`!teams {channel name} {# of teams}`");
      return;
    } else if (numTeams < 1) {
      message.reply("You cannot have fewer than 1 team.");
      return;
    } else if(selectedChannel == null) {
      message.reply("Channel with name " + voiceChannelName + " is not found.");
      return;
    } else if (selectedChannel.type != "voice") {
      message.reply("Only voice channels are supported. " + voiceChannelName + " is a `" + selectedChannel.type + "` channel");
      return;
    }
    
    let currentMemberNames = selectedChannel.members.map(e => e.user.username);
    
    // Verify there would be no empty teams
    let currentMemberLength = currentMemberNames.length;
    if (currentMemberLength < numTeams) {
      message.reply("Only " + currentMemberLength + " members in channel " + voiceChannelName + ". Please request " + currentMemberLength + " or fewer teams.");
      return;
    }
  
    helper.shuffle(currentMemberNames);
    let mixedTeams = helper.chunkify(currentMemberNames, numTeams, true);
    
    // Generate output message
    outputMessage = "\n";
    for (let i = 0; i < numTeams; i++) {
      outputMessage += "**__Team #" + (i + 1) + "__**\n";
      mixedTeams[i].forEach(name => {
        outputMessage += name + "\n"
      })
      outputMessage += "\n";
    }
  
    message.reply(outputMessage);
    return;
  }
  