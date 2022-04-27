'use strict';

const express = require('express');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use(express.static(__dirname))
  .get('/', (req, res) => res.sendFile('/Connexion.html', { root: __dirname }))
  .get('/test', (req, res) => res.sendFile('/Game.html', { root: __dirname }))
  .get('/death', (req, res) => res.sendFile('/GameOver.html', { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

var players = {};
var foods = [[5,5],[5,-5]];
//taille du terrain
let size = 200;

for(let i=0; i<100; i++){
	console.log(i);
	foods.push([Math.floor(Math.random()*size-size/2),Math.floor(Math.random()*size-size/2)]);
}
//console.log(foods);
const vitesse = (size)=>{}

io.on('connection', function (socket) {
  //permet de creer un nouveau joueur
	socket.on('newPlayer', function (infPlayer) {
		players[infPlayer['name']] = {"position":[0,0],"size":4,"color":infPlayer['color'],"time":new Date()};
		//console.log(players);
	});
  	// On donne les donnée joeurs
	socket.emit('recupererInfos', players);
	// On donne les foods
	socket.emit('recupererFoods', foods);

	// login
	socket.on('Credential', function (cred){
		console.log(cred.pseudo)
		console.log(cred.color)
	});
	
    // Quand on reçoit une nouvelle coo
	socket.on('newPacket', function (packet) {
		//update position
		var prev_time=players[packet["name"]]["time"]
		players[packet["name"]]["time"]=new Date()
		var delta_t=players[packet["name"]]["time"]-prev_time
		//console.log(packet);
		//console.log(delta_t);
		// players[packet["name"]]["position"][0] += packet["direction"][0] * 10/players[packet['name']]["size"];
		// players[packet["name"]]["position"][1] += packet["direction"][1] * 10/players[packet['name']]["size"];
		players[packet["name"]]["position"][0] += packet["direction"][0] * 3*delta_t/1000;
		players[packet["name"]]["position"][1] += packet["direction"][1] * 3*delta_t/1000;
		//console.log(players);

		//check bordure terrain
		if (players[packet["name"]]["position"][0] > size/2){
			players[packet["name"]]["position"][0] = size/2
		}
		if (players[packet["name"]]["position"][1] > size/2){
			players[packet["name"]]["position"][1] = size/2
		}
		if (players[packet["name"]]["position"][0] < -size/2){
			players[packet["name"]]["position"][0] = -size/2
		}
		if (players[packet["name"]]["position"][1] < -size/2){
			players[packet["name"]]["position"][1] = -size/2
		}

		//check for food
		foods.forEach(e =>{
			// console.log(e);
			// console.log(players[packet["name"]]["position"])
			// console.log("zzzz")
			if ((Math.sqrt((e[0]-players[packet["name"]]["position"][0])**2 + (e[1]-players[packet["name"]]["position"][1])**2)) < players[packet["name"]]["size"]/2){
				//console.log("aaa")
				foods = foods.filter(function(f) { return f !== e })
				foods.push([Math.floor(Math.random()*size-size/2),Math.floor(Math.random()*size-size/2)]);
				players[packet["name"]]["size"] += 1;
				
			}
		})

		//check for collision
		for (var player in players){
			if (player != packet["name"]){
				if ((Math.sqrt((players[player]["position"][0]-players[packet["name"]]["position"][0])**2 + (players[player]["position"][1]-players[packet["name"]]["position"][1])**2)) < players[packet["name"]]["size"]){
					if (players[packet["name"]]["size"] <= players[player]["size"]){
						players[player]["size"]+=players[packet["name"]]["size"];
						socket.emit('death',"req");
						delete players[packet["name"]];
					}
				}
				}
			}
		

		// On envoie à tous les clients connectés 
		socket.emit('recupererInfos', players);
		socket.emit('recupererFoods', foods);
		socket.emit('sendPacket')
	});
});



