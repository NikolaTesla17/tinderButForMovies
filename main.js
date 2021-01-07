//var app = require("express")();
var express = require('express');
var app = express();
app.use('/', express.static(__dirname + '/client/'));
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var movieTitlesPopular = [];
var Images = [];

const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb('7ebb7372a3c9fe1bbc2a149c8e67cdbb')

moviedb.moviePopular().then(res => {
    var i;
    for(i=4;i>=0;i--){
    //console.log(res.results[i])
    movieTitlesPopular[i] = res.results[i].original_title;
    Images[i] = res.results[i].poster_path;
}
  }).catch(console.error)

const {joinUser, removeUser, findUser} = require('./users');
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});




function search(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].name === nameKey) {
            return myArray[i];
        }
    }
    return;
}






rooms = [];
// let thisRoom = {room:"",movies:[],people:0,sockets:[]};
io.on("connection", function (socket) {
  socket.on("join room", (data) => {
    // let Newuser = joinUser(socket.id, data.username,data.roomName)





    io.to(socketid).emit('message', 'for your eyes only');

    var foundRoom = false;
    for (var i=0; i < rooms.length; i++) {
        if (rooms[i].room == data.roomname) {
            rooms[i].people++;
            foundRoom = true;
        }
    }
    if(!foundRoom){
        rooms.push({room:data.roomname,movies:[],people:1});
    }
    socket.join(data.roomname);




    io.to(thisRoom.room).emit("movies", {movieTitlesPopular,Images});
  });


  socket.on("dislike", (data) => {

        console.log("this room" + data.item);

        if(typeof(thisRoom.movies[data.item]) == "undefined"){
            thisRoom.movies[data.item]=0;
        }
  });

  socket.on("like", (data) => {
    console.log("this room" + data.item);

    if(typeof(thisRoom.movies[data.item]) == "undefined"){
        thisRoom.movies[data.item]=0;
    }
    thisRoom.movies[data.item]++;

    console.log(thisRoom.movies[data.item]+" votes out of "+thisRoom.people)
    console.log(thisRoom);


    if(thisRoom.movies[data.item]==thisRoom.people){ 
        movieTitle = movieTitlesPopular[data.item];
        imgUrl = Images[data.item];
        io.to(thisRoom.room).emit("match", {movieTitle,imgUrl});
    }
  });






  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log(user);
    if(user) {
      console.log(user.username + ' has left');
    }
    console.log("disconnected");

  });
});

http.listen(3000, function () {});