const Discord = require('discord.js');
function timer(callback, delay) {
    var Timeout, started = new Date(), remaining = delay;

    this.getTimeLeft = function() {
        remaining -= new Date() - started;
        started = new Date();
        var hr = Math.floor(remaining/3600000),
        min = Math.floor((remaining-3600000*hr)/60000), 
        sec = Math.floor((remaining/1000)%60);
        if(min>=5)
            min+=5;
        return `${hr}h ${min}min ${sec}s`;
    }

    this.getTimeFinish = function(){
        remaining -= new Date() - started;
        started = new Date();
        var hr = Math.floor(remaining/3600000),
        min = Math.floor((remaining-3600000*hr)/60000), 
        sec = Math.floor((remaining/1000)%60);
        if(min>=5)
            min+=5;
        var today = new Date();
        today.setTime(today.getTime()+hr*3600000+min*60000+sec*1000);
        return `${((today.getUTCHours()+1)%24<10? '0'+ (today.getUTCHours()+1)%24 : (today.getUTCHours()+1)%24)}:${today.getMinutes()<10? '0' + today.getMinutes() : today.getMinutes()}`; // UTC+2
    }

    this.stop = function(){
        clearTimeout(Timeout);
        Timeout = undefined;
        return;
    }

    Timeout = new setTimeout(callback, remaining);
}
module.exports = {
    name: 'base',
    description: "Will ping everyone after x time passed",
    execute(message, args, map, mapactive){
        const ms = require('ms');
        if(!args[0]){
            message.channel.send('Erreur de commande');
            return;
        }
        else if(args[0].toLowerCase()=='help'){
            const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Commandes')
            .setDescription('Liste des commandes')
            .addFields(
                { name: '!b help', value: "Affiche la liste des commandes" },
                { name: '!b [map] [temps]', value: "Créer un timer sur la map" },
                { name: '!b [map] stop', value: "Enlève le timer de la map" },
                { name: '!b list', value: "Affiche la liste des timer créés" },
                { name: 'LÉGENDES', value: "[Map] = 4.4 ou 4-4 // [Timer] = 00h00min00s" }
            )
            .setFooter('Made by ZFrogger#6467');

            message.channel.send(exampleEmbed);
            return;
        }
        else if(args[0].toLowerCase()=='list'){
            const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#ffff00')
            .setTitle('Timers')
            .setDescription('Liste des timers')
            .setFooter('Made by ZFrogger#6467');
            
            for(var i=0;i<4;++i){
                for(var j=0;j<8;++j){
                    if(mapactive[i][j]){
                        exampleEmbed.addField(`${i+1}-${((j+1)==8? 'BL': (j+1))}`, `${map[i][j].getTimeLeft()} Restant`); // | ${map[i][j].getTimeFinish()}`)
                    }
                }
            }
            message.channel.send(exampleEmbed);
            return;
        }
        else if(!args[1]){
            message.channel.send('Erreur de commande');
            return;
        }
        var a = -1;
        var b = -1;
        if(args[0].search('-')==1 || args[0].search('[.]')==1){
            a = args[0].substring(0,1);
            b = args[0].substring(2);
        }
        else {
            message.channel.send('Erreur de coordonnées');
            return;
        }
        if(b.toLowerCase()=='bl'){
            b=8;
        }
        a--;
        b--;
        if(a<0 || a>3 || a>-1 && a<3 && (b<2 || b>7) || a==3 && (b>4 || b<0)){
            message.channel.send('Erreur de coordonnées');
            return;
        }
        else if(args[1].toLowerCase()=='stop'){
            if(map[a][b]!=undefined){
                map[a][b].stop();
                map[a][b]=undefined;
                mapactive[a][b]=false;
                message.channel.send('Annulation du rappel pour la base en ' + (a+1) + '-' + (b==7 ? 'BL': b+1));
            }
            else
                message.channel.send("Il n'y a rien à annuler pour la base en " + (a+1) + '-' + (b==7 ? 'BL': b+1));
        }
        else if(ms(args[1]) > 86400000){
            message.channel.send('Erreur temps supérieur à 24h');
            return;
        }
        else {
            var heures = '0';
            var minutes = '0';
            var secondes = '0';
            var total = 0;
            if(args[1].search(/([0-9]+)h.*/)!=-1){
                heures = args[1].replace(/([0-9]+)h.*/,'$1');
                if(args[1].search(/[0-9]+h([0-9]+)(m|min)?.*/)!=-1){
                    minutes = args[1].replace(/[0-9]+h([0-9]+)(m|min)?.*/,'$1');
                    if(args[1].search(/.*[0-9]+(m|min)([0-9]+)s?/)!=-1){
                        secondes = args[1].replace(/.*[0-9]+(m|min)([0-9]+)s?/,'$2');
                    }
                }
            }
            else if(args[1].search(/([0-9]+)(m|min).*/)!=-1){
                minutes = args[1].replace(/([0-9]+)(m|min).*/,'$1');
                if(args[1].search(/.*[0-9]+(m|min)([0-9]+)s?/)!=-1){
                    secondes = args[1].replace(/.*[0-9]+(m|min)([0-9]+)s?/,'$2');
                }
            }
            else if(args[1].search(/([0-9]+)s?/)!=-1){
                secondes = args[1].replace(/([0-9]+)s?/,'$1');
            }

            total = ms(heures+'h') + ms(minutes+'m') + ms(secondes+'s');
            if(total==0){
                message.channel.send('Erreur de temps');
                return;
            }
            else if(map[a][b]==undefined){
                var today = new Date();
                today.setTime(today.getTime()+heures*3600000+minutes*60000+secondes*1000); // UTC+2 en été | UTC+1 en hiver
                message.channel.send(`Je vous préviendrai dans ${heures}h ${minutes}min ${secondes}s`);// à ${((today.getUTCHours()+1)%24<10? '0'+ (today.getUTCHours()+1)%24 : (today.getUTCHours()+1)%24)}:${today.getMinutes()<10? '0' + today.getMinutes() : today.getMinutes()}`);
                if(total>300000){
                    mapactive[a][b]=true;
                    map[a][b] = new timer(function(){
                        message.channel.send('Base en ' + (a+1) + '-' + (b==7 ? 'BL': b+1) + ' ouverte DANS 5 MIN !');
                        map[a][b].stop();
                        map[a][b] = undefined;
                        map[a][b] = new timer(function(){
                            message.channel.send('BASE EN ' + (a+1) + '-' + (b==7 ? 'BL': b+1) + ' OUVERTE !');
                            map[a][b].stop();
                            map[a][b] = undefined;
                            mapactive[a][b]=false;
                        }, ms('5m'));
                    }, total - ms('5m'));
                }
                else{
                    mapactive[a][b]=true;
                    map[a][b] = new timer(function(){
                        message.channel.send('BASE EN ' + (a+1) + '-' + (b==7 ? 'BL': b+1) + ' OUVERTE !');
                        map[a][b].stop();
                        map[a][b] = undefined;
                        mapactive[a][b]=false;
                    }, total);
                }
                
            } else {
                message.channel.send('Il y a déjà un timer de lancé pour ces coordonnées !');
                message.channel.send(map[a][b].getTimeLeft() + ' Restant');
            }
        }
    }
}