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
    movieTitlesPopular[i] = res.results[i].original_title;
    Images[i] = res.results[i].poster_path;
}
  }).catch(console.error)

// const {joinUser, removeUser, findUser} = require('./users');
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});


moviedb.moviePopular().then(res => {
console.log("here is the response              " + res);
}).catch(console.error)






rooms = [];
// let thisRoom = {room:"",movies:[],people:0,sockets:[]};
io.on("connection", function (socket) {
  socket.on("join room", (data) => {



    var foundRoom = false;
    for (var i=0; i < rooms.length; i++) {
        if (rooms[i].room == data.roomname) {
            rooms[i].people++;
            rooms[i].sockets.push(socket.id);
            foundRoom = true;
        }
    }
    if(!foundRoom){
        rooms.push({room:data.roomname,movies:[],people:1,sockets:[socket.id]});
    }
    socket.join(data.roomname);




    io.to(data.roomname).emit("movies", {movieTitlesPopular,Images});
    console.log(rooms);
  });


  socket.on("dislike", (data) => {
        // if(typeof(rooms.movies[data.item]) == "undefined"){
        //     thisRoom.movies[data.item]=0;
        // }
        for (var i=0; i < rooms.length; i++) {
            if (rooms[i].room == data.roomName) {
                var roomNum = i;
            }
        }
        if(typeof(rooms[roomNum].movies[data.movie]) == "undefined"){
            rooms[roomNum].movies[data.movie] = 0;
        }

        console.log(rooms);
  });

  socket.on("like", (data) => {



    for (var i=0; i < rooms.length; i++) {
        if (rooms[i].room == data.roomName) {
            var roomNum = i;
        }
    }
    console.log("rooms at this point is" + rooms);
    console.log("roomNum at this point is" + data.roomName);
    if(typeof(rooms[roomNum].movies[data.movie]) == "undefined"){
        rooms[roomNum].movies[data.movie] = 0;
    }
    rooms[roomNum].movies[data.movie]++;
    if(rooms[roomNum].movies[data.movie]==rooms[roomNum].people){
        console.log("we have a match")
    }

    console.log(rooms);
  });






  socket.on("disconnect", () => {
    for (var i=0; i < rooms.length; i++) {
        if (rooms[i].sockets.includes(socket.id)) {
            rooms[i].people--;
            rooms[i].sockets.splice(rooms[i].sockets.indexOf(socket.id),1);
        }
    }


    console.log(rooms);
  });
});

http.listen(3000, function () {});