var canvas = document.getElementsByTagName('canvas')[0]
var context = canvas.getContext('2d')

var width = (canvas.width = window.innerWidth)
var height = (canvas.height = window.innerHeight)

var x = width / 2
var y = height / 2

var commands = {
  left: false,
  right: false,
  up: false,
  down: false
}

var speed = 10

function draw() {
  if (commands.left) {
    x -= speed
  }
  if (commands.right) {
    x += speed
  }
  if (commands.up) {
    y -= speed
  }
  if (commands.down) {
    y += speed
  }
  x = Math.min(Math.max(x, 10), width - 10) // borders
  y = Math.min(Math.max(y, 10), height - 10) // borders

  context.fillStyle = '#2d3142'
  context.fillRect(0, 0, width, height) // draw background

  context.strokeStyle = '#4f5d75'
  context.lineWidth = 20
  context.strokeRect(10, 10, width - 20, height - 20) // draw border

  context.strokeStyle = '#ef8354'
  context.lineWidth = 10
  context.strokeRect(x - 5, y - 5, 10, 10) // draw player

  requestAnimationFrame(draw) // set next frame
}

window.addEventListener('keydown', function(event) {
  switch (event.key) {
    case 'w':
    case 'ArrowUp':
      commands.up = true
      break
    case 'a':
    case 'ArrowLeft':
      commands.left = true
      break
    case 's':
    case 'ArrowDown':
      commands.down = true
      break
    case 'd':
    case 'ArrowRight':
      commands.right = true
      break
  }
})
window.addEventListener('keyup', function(event) {
  switch (event.key) {
    case 'w':
    case 'ArrowUp':
      commands.up = false
      break
    case 'a':
    case 'ArrowLeft':
      commands.left = false
      break
    case 's':
    case 'ArrowDown':
      commands.down = false
      break
    case 'd':
    case 'ArrowRight':
      commands.right = false
      break
  }
})

draw()