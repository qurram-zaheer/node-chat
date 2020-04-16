const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, "../public")

app.use(express.static(publicDirPath))


io.on('connection', (socket) => {
   console.log("New connection!")

   socket.on('sendMessage', (message, callback) => {
      const filter = new Filter()
      if (filter.isProfane(message)) {
         return callback("No profanity!")
      }
      const currentUser = getUser(socket.id)


      io.to(currentUser.room).emit('message', generateMessage(currentUser.username, message))


      callback()
   })


   socket.on('disconnect', () => {
      const removedUser = removeUser(socket.id)

      if (removedUser) {
         io.to(removedUser.room).emit('message', generateMessage('Room Admin #' + Math.floor(Math.random() * 100000), `${removedUser.username} has left the chat!`))
         io.to(removedUser.room).emit('roomData', {
            room: removedUser.room,
            users: getUsersInRoom(removedUser.room)
         })
      }

   })


   socket.on('sendLocation', ({ latitude, longitude }, callback) => {
      const currentUser = getUser(socket.id)

      io.to(currentUser.room).emit('locationMessage', generateLocationMessage(currentUser.username, 'https://google.com/maps/?q=' + latitude + "," + longitude))


      callback()
   })

   socket.on('join', ({ username, room }, callback) => {
      const { error, user } = addUser({ id: socket.id, username, room })
      if (error) {
         return callback(error)
      }
      socket.join(user.room)
      socket.emit('message', generateMessage('Room Admin #' + Math.floor(Math.random() * 100000), "Welcome!"))
      socket.broadcast.to(user.room).emit('message', generateMessage('Room Admin #' + Math.floor(Math.random() * 100000), `${user.username} has joined the chat!`))
      io.to(user.room).emit('roomData', {
         room: user.room,
         users: getUsersInRoom(user.room)
      })
      callback()
   })
})



server.listen(PORT, () => console.log("Server running on PORT " + PORT))