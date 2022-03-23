'use strict';

const express = require('express');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

var messages = [];

io.on('connection', function (socket) {
  // On donne la liste des messages (événement créé du côté client)
  socket.emit('recupererMessages', messages);
  // Quand on reçoit un nouveau message
  socket.on('nouveauMessage', function (mess) {
      console.log("dddddddddd");
      console.log(mess);
      // On l'ajoute au tableau (variable globale commune à tous les clients connectés au serveur)
      messages[mess.id] = mess.coos
      // On envoie à tous les clients connectés (sauf celui qui a appelé l'événement) le nouveau message
      socket.broadcast.emit('recupererNouveauMessage', mess);
  });
});


