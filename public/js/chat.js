const socket = io()

const $messageForm = document.getElementById("message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $shareLocBtn = document.getElementById("sendLocation")
const $messages = document.getElementById("messages")

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const autoScroll = () => {
   // new message element
   const $newMessage = $messages.lastElementChild


   //height of the new message
   const newMessageStyles = getComputedStyle($newMessage)
   const newMessageMargin = parseInt(newMessageStyles.marginBottom)
   const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

   //visible height
   const visibleHeight = $messages.offsetHeight

   //Height of messages container
   const containerHeight = $messages.scrollHeight

   //Current scroll position
   const scrollOffset = $messages.scrollTop + visibleHeight

   if (containerHeight - newMessageHeight <= scrollOffset) {
      $messages.scrollTop = $messages.scrollHeight
   }
}



socket.on('message', (newMessage) => {

   const html = Mustache.render(messageTemplate, {
      username: newMessage.username,
      message: newMessage.text,
      createdAt: moment(newMessage.createdAt).format("h:mm a")
   })
   $messages.insertAdjacentHTML('beforeend', html)
   autoScroll()
})

socket.on('locationMessage', (location) => {

   const html = Mustache.render(locationMessageTemplate, {
      username: location.username,
      url: location.url,
      createdAt: moment(location.createdAt).format("h:mm a")
   })
   $messages.insertAdjacentHTML('beforeend', html)
   autoScroll()
})


$messageForm.addEventListener('submit', (e) => {
   e.preventDefault()

   $messageFormButton.setAttribute('disabled', 'disabled')
   const message = e.target.elements.message.value
   socket.emit('sendMessage', message, (error) => {
      $messageFormButton.removeAttribute('disabled')
      $messageFormInput.value = ""
      $messageFormInput.focus()
      if (error) {
         return console.log(error)
      }
      console.log("Delivered!")
   })
})


$shareLocBtn.addEventListener('click', () => {
   if (!navigator.geolocation) {
      return alert("Geolocation is not supported by your browser!")
   }
   $shareLocBtn.setAttribute('disabled', 'disabled')
   navigator.geolocation.getCurrentPosition((position) => {
      socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude }, () => {
         $shareLocBtn.removeAttribute('disabled')
         console.log("Location shared!")
      })
   })
})

socket.emit('join', { username, room }, (error) => {
   if (error) {
      alert(error)
      location.href = "/"
   }
})

socket.on('roomData', ({ room, users }) => {
   const html = Mustache.render(sidebarTemplate, {
      room, users
   })
   document.querySelector("#sidebar").innerHTML = html
})