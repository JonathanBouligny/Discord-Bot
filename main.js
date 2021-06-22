const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const fetch = require('node-fetch');
require('dotenv').config();

const help_command = (message) => {
    console.log(message.author.username + " ran help command");
    message.channel.send("Commands List: " +
        "\n!UpdateNick (SummonerName) - will update your name in the server with your solo rank and current LP" +
        "\n!HelpRitoNamer - You already know what this does lul")
}

const update_nick_command = (name, message) => {
    // Secret
    console.log(message.author.username + " ran update nick command command");

    fetch('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + encodeURIComponent(name), {method: 'GET', headers: {
            "X-Riot-Token": process.env.Riot_API_Key
        }})
        .then(res => res.text())
        .then(body => {

            let parsedJson = JSON.parse(body)

            // Secret
            fetch('https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + parsedJson['id'], {method: 'GET', headers: {
                    "X-Riot-Token": process.env.Riot_API_Key
                }})
                .then(res => res.text())
                .then(body => JSON.parse(body).find(x => x.queueType === "RANKED_SOLO_5x5"))
                .then(rankInfo => {
                    // set nick to get name
                    if(!rankInfo) {
                        message.member.setNickname("I suck")
                            .then(()=> {
                                message.channel.send('You suck');
                            })
                            .catch(err => {
                                message.channel.send("ERROR SETING NICKNAME? PERMISSIONS ISSUE OR OWNER RUNNING COMMAND?:" + err);
                            });
                    } else {
                        message.member.setNickname(rankInfo.tier.toLowerCase() + " " + rankInfo.rank + " LP:" + rankInfo.leaguePoints)
                            .then(()=> {
                                message.channel.send('Set name to ' + rankInfo.tier.toLowerCase() + " " + rankInfo.rank + " " + rankInfo.leaguePoints);
                            })
                            .catch(err => {
                                message.channel.send("ERROR SETING NICKNAME? PERMISSIONS ISSUE OR OWNER RUNNING COMMAND?:" + err);
                            });
                    }

                })
                .catch( err => {
                    message.channel.send('Error finding rank info for: ' + name + ' ' + err);
                })
        })
        .catch( err => {
            message.channel.send('Error finding summoner info for: ' + name);
        })
}

const splitWithTail = (str, delim, count) => {
    var parts = str.split(delim);
    var tail = parts.slice(count).join(delim);
    var result = parts.slice(0,count);
    result.push(tail);
    return result;
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    var splitMsg = splitWithTail(message.content, " ", 1)

    if(!splitMsg)
        return;

    if(splitMsg[0][0] !== '!')
        return;

    if(message.author.username === 'Rito Rank Namer')
        return;

    switch(splitMsg[0]) {
        case "!UpdateNick":
            if(splitMsg[1]) {
                update_nick_command(splitMsg[1], message)
            } else {
                message.channel.send("Incorrect input for !UpdateNick. Please type '!UpdateNick (SummonerName)'");
            }
            break;
        case "!HelpRitoNamer":
            help_command(message);
            break;
        default:
            message.channel.send(" '" + splitMsg[0] + "' is an invalid Command. Please type '!Help for a list of commands'");
    }
});

client.login(process.env.Discord_API_Key);