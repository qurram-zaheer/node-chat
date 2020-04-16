const users = []

const addUser = ({ id, username, room }) => {
   // Clean data
   username = username.trim().toLowerCase()
   room = room.trim().toLowerCase()

   // Validation
   if (!username || !room) {
      return {
         error: 'Username and room are required!'
      }
   }

   // Check for existing user
   const existingUser = users.find((user) => {
      return user.room === room && user.username === username
   })
   if (existingUser) {
      return {
         error: 'Username already in use for this room!'
      }
   }

   // Store user
   const user = { id, username, room }
   users.push(user)
   return { user }
}

const removeUser = (id) => {
   const index = users.findIndex(user => {
      return user.id === id
   })
   let removed = null;
   if (index != -1) {
      removed = users.splice(index, 1)[0]
   }

   return removed
}

const getUser = (id) => {
   const user = users.find(user => {
      return user.id === id
   })
   return user
}

const getUsersInRoom = (room) => {
   const roomUsers = users.filter(user => user.room.trim().toLowerCase() === room.trim().toLowerCase())
   return roomUsers
}

module.exports = {
   addUser,
   removeUser,
   getUser,
   getUsersInRoom
}