const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require('fs')	
let settings = JSON.parse(fs.readFileSync(__dirname+"/settings.json"));	
let prefix = settings['prefix'];	
let cooldown = settings['cooldown']	
const generated = new Set();	


bot.on("ready", () => {	
    console.log(`Logged in as ${bot.user.tag}!`);	
    console.log("prefix is",prefix,"\nCooldown is",cooldown)	
});	

bot.on("message", async message => {	
    prefix = settings['prefix'];	
    cooldown = settings['cooldown']	
    if (message.author.bot) return;	
    var command = message.content	
    .toLowerCase()	
    .slice(prefix.length)	
    .split(" ")[0];	

    if (command === "gen") {	
        if(message.channel.id !== "1030370390746337320") return message.channel.send("Veuillez gen dans le salon prévu à cet effet")	

        if (generated.has(message.author.id)) {	
            message.channel.send("Veuillez attendre avant de générer un autre compte! - " + message.author);	
        } else {	

            let messageArray = message.content.split(" ");	
            let args = messageArray.slice(1);	
            if (!args[0]) return message.reply("Merci de préciser la prestation souhaitée!");	
            let data;	
            try{	
                data = fs.readFileSync(__dirname + "/" + args[0].toLowerCase() + ".json")	

            } catch{	
                return message.reply(args[0].toLowerCase()+' service do not exists')  	
            } 	
            let account = JSON.parse(data)	
                if (account.length <= 0) return message.reply("Il n'y a pas de compte disponible pour ce service")	
                const embed = {	
                    title: "Compte généré!",	
                    description: "Vérifie tes mp pour les informations du compte!",	
                    color: 8519796,	
                    timestamp: "2019-04-04T14:16:26.398Z",	
                    footer: {	
                        icon_url:	
                            "https://cdn.discordapp.com/avatars/530778425540083723/7a05e4dd16825d47b6cdfb02b92d26a5.png",	
                        text: "Acheter des bots discord à 𝘕𝘢𝘵𝘩𝘢𝘯𝘭𝘦𝘣𝘨#5264"	
                    },	
                    thumbnail: {	
                        url:	
                            "http://www.compartosanita.it/wp-content/uploads/2019/02/right.png"	
                    },	
                    author: {	
                        name: "Générateur de compte",	
                        url: "https://discordapp.com",	
                        icon_url: bot.displayAvatarURL	
                    },	
                    fields: []	
                };	

                await message.channel.send({ embed });	
                await generated.add(message.author.id);	
                await message.author.send({embed: {	
                    "title": "Information du compte",	
                    "color": 1127848,	
                    "fields": [	
                      {	
                        "name": "Username/Email",	
                        "value": account[0].email	
                      },	
                      {	
                        "name": "Password",	
                        "value": account[0].password	
                      }	
                    ]	
                  }	
                })	
                await message.author.send("copy-paste: "+account[0].email+":"+account[0].password)	
                account.splice(0,1)	
                console.log(account)	
                fs.writeFileSync(__dirname + "/" + args[0] + ".json", JSON.stringify(account));	
                setTimeout(() => {	
                    generated.delete(message.author.id);	
                }, cooldown);	
        }	
    }	

    if (command === "check") {	
        let messageArray = message.content.split(" ");	
        let args = messageArray.slice(1);	
        let data;	
        if (!args[0])	
            return message.reply("Merci de préciser la compte souhaitée!");	
        try{	
            data = JSON.parse(fs.readFileSync(__dirname + "/" + args[0] + ".json"))	
            message.channel.send("Il y a "+data.length+" comptes dans "+args[0])	

        } catch {	
            return message.reply('Ce service n’existe pas')  	
        } 	
    }	

    if (command === "change"){	
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply("Désolé mais tu n'a pas les permission administratifs!");	
        let messageArray = message.content.split(" ");	
        let args = messageArray.slice(1);	
        try{	
            settings[args[0].toLowerCase()] = args[1].toLowerCase()	
            fs.writeFileSync(__dirname+"/settings.json", JSON.stringify(settings));	
            message.reply(args[0]+" changed to "+args[1])	

        } catch{	
            message.reply("An error occured")	
        }	
    }	

    if(command === "stock"){	
        let stock = []	

        fs.readdir(__dirname, function (err, files) {	
            if (err) {	
                return console.log('Unable to scan directory: ' + err);	
            } 	

            files.forEach(function (file) {	
                if (!file.includes(".json")) return	
                if (file.includes('package-lock') || file.includes('package.json') || file.includes('settings.json')) return	
                stock.push(file) 	
            });	
            console.log(stock)	

            stock.forEach(async function (data) {	
                let acc = await fs.readFileSync(__dirname + "/" + data)	
                message.channel.send(data.replace(".json","")+" has "+JSON.parse(acc).length+" accounts\n")	

            })	

        });	
    }	

    if(command === "add") {	
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply("Désolé mais tu n'a pas les permission administratifs!");	
        let messageArray = message.content.split(" ");	
        let args = messageArray.slice(1);	
        var acc = args[1].split(":");	

        fs.readFile(__dirname + "/" + args[0].toLowerCase() + ".json",function(err, data) { 	
        if(err){	
            let newnewData = 	
            [{	
                "email":acc[0],	
                "password":acc[1]	
            }]	
            try {	
                fs.writeFileSync(__dirname + "/" + args[0].toLowerCase()+".json", JSON.stringify(newnewData))	
                message.reply("Service créer et compte ajouter!")	
            } catch {	
                message.channel.send('**Erreur** Impossible de créer le service et d’ajouter ce compte!')	

            }	
        }	

        else {	
            let newData = {"email":acc[0],"password":acc[1]}	
            data = JSON.parse(data)	
            try{	
                data.push(newData)	
                fs.writeFileSync(__dirname + "/" + args[0].toLowerCase()+".json", JSON.stringify(data))	
                message.reply("Compte ajouter")	
            } catch {	
                message.channel.send('**Erreur** Je n’arrive pas à ajouter ce compte!')	
            }	
        }	
    }); 	
}	

if(command === "help") {	
    if (!message.member.hasPermission("ADMINISTRATOR")) {	
        message.channel.send({embed: {	
        "title": "Commands",	
        "color": 1127848,	
        "fields": [	
          {	
            "name": prefix+"gen SERVICENAME",	
            "value": "générer un compte de ce service."	
          },	
          {	
            "name": prefix+"check SERVICENAME",	
            "value": "vérifier combien de comptes sont dans ce serveur."	
          },	
          {	
            "name": prefix+"stock",	
            "value": "vérifier les services et les comptes.."	
          }	
        ]	
      } 	

    })	
} else {	
        message.channel.send({embed: {	
        "title": "Commands",	
        "color": 1127848,	
        "fields": [	
          {	
            "name": prefix+"gen COMPTE",	
            "value": "générer un compte de ce service."	
          },	
          {	
            "name": prefix+"check SERVICENAME",	
            "value": "vérifier combien de comptes sont dans ce serveur."	
          },	
          {	
            "name": prefix+"stock",	
            "value": "vérifier les services et les comptes.."	
          },	
          {	
            "name": prefix+"add SERVICENAME ACCOUNT",	
            "value": " ajoutez ce compte au service, n'oubliez pas d'utiliser la syntaxe username:password"	
          },	
          {	
            "name": prefix+"change OPTION VALUE",	
            "value": "changer le préfixe ou le temps de recharge (option) en une valeur, pour le temps de recharge rappelez-vous que la valeur doit être en ms"	
          }	
        ]	
      }	

    })	
}	
}	
})	

bot.login("MTAyMDczMzkyMzUwNjAxMjE2MQ.GtpsPP.xYHRXeSIFg1XdZmCnzVgGIinO3z_W3XHeec7zU");	
