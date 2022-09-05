const Discord = require('discord.js');

const client = new Discord.Client();

const prefix = "!";

const fs = require('fs');

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}
client.once('ready', ()=> {
    console.log('Base is online!')
});

var map = new Array(4)
for (var i=0;i<map.length;++i){
    map[i] = new Array(7);
}
var mapactive = new Array(4)
for (var i=0;i<mapactive.length;++i){
    mapactive[i] = new Array(7);
    for (var j=0;j<7;++j){
        mapactive[i][j]=false;
    }
}
client.on('message', message =>{
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if(command === 'b'){
        client.commands.get('base').execute(message, args, map, mapactive);
    }
})

client.login(process.env.token);