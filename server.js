
'use strict';

const express = require('express');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use(express.static(__dirname))
  .get('/', (req, res) => res.sendFile('/Connexion.html', { root: __dirname }))
  .get('/test', (req, res) => res.sendFile('/Game.html', { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

var players = {};
var foods = [[2,7],[2,0],[0,5]];
const vitesse = (size)=>{}

io.on('connection', function (socket) {
  //permet de creer un nouveau joueur
	socket.on('newPlayer', function (infPlayer) {
		players[infPlayer['name']] = {"position":[0,0],"size":4,"color":infPlayer['color']};
		console.log(players);
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
		console.log(packet);
		players[packet["name"]]["position"][0] += packet["direction"][0] * 10/players[packet['name']]["size"];
		players[packet["name"]]["position"][1] += packet["direction"][1] * 10/players[packet['name']]["size"];
		console.log(players);
		//check for food
		foods.forEach(e =>{
			if ((Math.sqrt((e[0]-players[packet["name"]]["position"][0])**2 + (e[1]-players[packet["name"]]["position"][1])**2)) > players[packet["name"]]["size"]){
				foods.pop(e);
				players[packet["name"]]["size"] += 2;
				//foods.push([Math.round(Math.random()*10),Math.round(Math.random()*10)])
			}
		})

		//check for collision
		for (var player in players){
			if (player != packet["name"]){
				if ((Math.sqrt((players[player]["position"][0]-players[packet["name"]]["position"][0])**2 + (players[player]["position"][1]-players[packet["name"]]["position"][1])**2)) < players[packet["name"]]["size"]){
					if (players[packet["name"]]["size"] > players[player]["size"]){
						players[packet["name"]]["size"] += players[player]["size"];
						delete players[player];
					}else{
						players[player]["size"] += players[packet["name"]]["size"];
						delete players[packet["name"]];
					}
				}
			}
		}

		// On envoie à tous les clients connectés 
		socket.emit('recupererInfos', players);
		socket.emit('recupererFoods', foods);
	});
});
