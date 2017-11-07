class GameObject {
  constructor(ctx) {
    this.ctx = ctx
  }
  draw() {
    let ctx = this.ctx
    ctx.save()
    this.doDraw()  // implemented by sub-classes
    ctx.restore()
  }
}
class Border extends GameObject {
  constructor(ctx, props) {
    super(ctx)
    this.topLeft = props.topLeft
    this.dimension = props.dimension
    this.width = props.width
  }
  doDraw() {
    let ctx = this.ctx
    ctx.strokeStyle = '#4f5d75'
    ctx.lineWidth = this.width
    ctx.strokeRect(this.topLeft.x, this.topLeft.y, this.dimension.width, this.dimension.height)
  }
}
class Player extends GameObject {
  constructor(ctx, props) {
    super(ctx)
    this.center = props.center
    this.width = props.width
    this.speed = props.speed
    this.commands = {}
  }
  doDraw() {
    let ctx = this.ctx
    ctx.strokeStyle = '#ef8354'
    ctx.lineWidth = this.width / 2
    ctx.strokeRect(this.center.x - this.width / 4, this.center.y - this.width / 4, this.width / 2, this.width / 2)
  }
  keyDown(key) {
    this.commands[key] = true
  }
  keyUp(key) {
    this.commands[key] = false
  }
  nextState() {
    if (this.commands['ArrowUp']) {
      this.center.y -= this.speed
    }
    if (this.commands['ArrowRight']) {
      this.center.x += this.speed
    }
    if (this.commands['ArrowDown']) {
      this.center.y += this.speed
    }
    if (this.commands['ArrowLeft']) {
      this.center.x -= this.speed
    }
  }
}
class Game extends GameObject {
  constructor(ctx, dimension) {
    super(ctx)
    this.ctx = ctx
    this.dimension = dimension

    let lineWidth = 20
    this.border = new Border(ctx, {
      topLeft: {
        x: lineWidth / 2,
        y: lineWidth / 2
      },
      dimension: {
        width: dimension.width - lineWidth,
        height: dimension.height - lineWidth
      },
      width: lineWidth
    })
    this.player = new Player(ctx, {
      center: {
        x: dimension.width / 2,
        y: dimension.height / 2
      },
      width: 20,
      speed: 10
    })
  }
  drawBackground() {
    let ctx = this.ctx
    ctx.save()
    ctx.fillStyle = '#2d3142'
    ctx.fillRect(0, 0, this.dimension.width, this.dimension.height)
    ctx.restore()
  }
  doDraw() {
    this.drawBackground()
    this.border.draw()
    this.player.draw()
  }
  keyDown(key) {
    this.player.keyDown(key)
  }
  keyUp(key) {
    this.player.keyUp(key)
  }
  checkCollision() {
    if (this.player.center.x - this.player.width / 2 < this.border.width) {
      this.player.center.x = this.border.width + this.player.width / 2
      console.log('hit left')
    }
    if (this.player.center.x + this.player.width / 2 > this.border.dimension.width) {
      this.player.center.x = this.border.dimension.width - this.player.width / 2
      console.log('hit right')
    }
    if (this.player.center.y - this.player.width / 2 < this.border.width) {
      this.player.center.y = this.border.width + this.player.width / 2
      console.log('hit top')
    }
    if (this.player.center.y + this.player.width / 2 > this.border.dimension.height) {
      this.player.center.y = this.border.dimension.height - this.player.width / 2
      console.log('hit bottom')
    }
  }
  nextState() {
    this.player.nextState()
    this.checkCollision()
  }
  nextFrame() {
    this.nextState()
    this.draw()
    window.requestAnimationFrame(() => this.nextFrame())
  }
  start() {
    this.nextFrame()
  }
}

function listenOnKeys(game) {
  window.addEventListener('keydown', (e) => {
    game.keyDown(e.key)
  })
  window.addEventListener('keyup', (e) => {
    game.keyUp(e.key)
  })
}
function init() {
  let $canvas = document.getElementsByTagName('canvas')[0]
  $canvas.width = window.innerWidth
  $canvas.height = window.innerHeight
  let game = new Game(
    $canvas.getContext('2d'),
    {
      width: $canvas.width,
      height: $canvas.height
    }
  )
  listenOnKeys(game)
  game.start()
}
init()
let c = document.getElementsByTagName('canvas')[0].getContext('2d')
