//var app = require("express")();
var express = require('express');
var app = express();
app.use('/', express.static(__dirname + '/client/'));
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var movieTitles = [];
var Images = [];

const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb('7ebb7372a3c9fe1bbc2a149c8e67cdbb')

moviedb.moviePopular().then(res => {
    var i;
    for(i=4;i>=0;i--){
    //console.log(res.results[i])
    movieTitles[i] = res.results[i].original_title;
    Images[i] = res.results[i].poster_path;
}
  }).catch(console.error)

const {joinUser, removeUser, findUser} = require('./users');
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});




let thisRoom = {room:"",movies:[],people:0};
io.on("connection", function (socket) {






  console.log("connected");
  socket.on("join room", (data) => {
    console.log('in room');

    let Newuser = joinUser(socket.id, data.username,data.roomName)
    //io.to(Newuser.roomname).emit('send data' , {username : Newuser.username,roomname : Newuser.roomname, id : socket.id})
   // io.to(socket.id).emit('send data' , {id : socket.id ,username:Newuser.username, roomname : Newuser.roomname });
   socket.emit('send data' , {id : socket.id ,username:Newuser.username, roomname : Newuser.roomname });
   
    thisRoom.room = Newuser.roomname;
    console.log(Newuser);
    socket.join(Newuser.roomname);

    thisRoom.people+=1;


    io.to(thisRoom.room).emit("movies", {movieTitles,Images});




  });


//   socket.on("chat message", (data) => {
//     io.to(thisRoFthiom).emit("chat message", {data:data,id : socket.id});
//   });

socket.on("dislike", (data) => {
    //serverside check likes?
    //io.to(thisRoom).emit("like", {data:data.id : socket.id});

    //console.log("User");
    console.log("this room" + data.item);

    if(typeof(thisRoom.movies[data.item]) == "undefined"){
        thisRoom.movies[data.item]=0;
    }
    // thisRoom.movies[data.item]+=1;

    console.log(thisRoom.movies[data.item]+" votes out of "+thisRoom.people)
    console.log(thisRoom);



  });





socket.on("like", (data) => {
    //serverside check likes?
    //io.to(thisRoom).emit("like", {data:data.id : socket.id});

    //console.log("User");
    console.log("this room" + data.item);

    if(typeof(thisRoom.movies[data.item]) == "undefined"){
        thisRoom.movies[data.item]=0;
    }
    thisRoom.movies[data.item]++;

    console.log(thisRoom.movies[data.item]+" votes out of "+thisRoom.people)
    console.log(thisRoom);


    if(thisRoom.movies[data.item]==thisRoom.people){
        // movieNum = data.item+1;
        // console.log("data item" + Images[movieNum] + "        " + movieTitles[movieNum]);  
        movieTitle = movieTitles[data.item+1];
        imgUrl = Images[data.item+1];
        console.log("stuf" + movieTitle + imgUrl)
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