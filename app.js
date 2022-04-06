var http    =	require('http');
var fs      =	require('fs');

// Creation du serveur
var app = http.createServer(function (req, res) {
	// On lit notre fichier app.html
	fs.readFile('./tchat.html', 'utf-8', function(error, content) {
		res.writeHead(200, {'Content-Type' : 'text/html'});
		res.end(content);
	});
});

// Variables globales
// Ces variables resteront durant toute la vie du seveur pour et sont commune pour chaque client (node server.js)
// liste des messages de la forme { pseudo :{ coos:{x:1 , y:2}, size : 231}}
var players = {};
foods = [[2,7],[2,0],[0,5]]
//// SOCKET.IO ////

var io = require('socket.io')(http);

// Socket io ecoute maintenant notre application !
io = io.listen(app); 

// Quand une personne se connecte au serveur
io.sockets.on('connection', function (socket) {

	//permet de creer un nouveau joueur
	socket.on('newPlayer', function (pseudo) {
		players[pseudo] = {"position":[0,0],"size":4};
		console.log(players);
	});

	// On donne les donnée joeurs
	socket.emit('recupererInfos', players);
	// On donne les foods
	socket.emit('recupererFoods', foods);

	// Quand on reçoit une nouvelle coo
	socket.on('newPacket', function (packet) {
		//update position
		console.log(packet);
		players[packet["name"]]["position"][0] += packet["direction"][0]
		players[packet["name"]]["position"][1] += packet["direction"][1]

		//check for food
		foods.forEach(e =>{
			if ((Math.sqrt((e[0]-players[packet["name"]]["position"][0])**2 + (e[1]-players[packet["name"]]["position"][1])**2)) > players[packet["name"]]["size"]){
				foods.pop(e)
				players[packet["name"]]["size"] += 2
				foods.push([Math.round(Math.random()*10),Math.round(Math.random()*10)])
			}
		})

		//check for collision
		for (player in players){
			if (player != packet["name"]){
				if ((Math.sqrt((players[player]["position"][0]-players[packet["name"]]["position"][0])**2 + (players[player]["position"][1]-players[packet["name"]]["position"][1])**2)) < players[packet["name"]]["size"]){
					if (players[packet["name"]]["size"] > players[player]["size"]){
						players[packet["name"]]["size"] += players[player]["size"]
						delete players[player]
					}else{
						players[player]["size"] += players[packet["name"]]["size"]
						delete players[packet["name"]]
					}
				}
			}
		}

		console.log(foods)
		// On envoie à tous les clients connectés 
		socket.emit('recupererInfos', players);
		socket.emit('recupererFoods', foods);
	});


});

///////////////////

// Notre application ecoute sur le port 8080
app.listen(8080);
console.log('Live Chat App running at http://localhost:8080/');