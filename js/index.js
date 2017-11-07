class GameObject {
  constructor(ctx) {
    this.ctx = ctx
  }
  draw() {
    let ctx = this.ctx
    this.doDraw()  // implemented by sub-classes
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
    let needNextFrameUpdate = false
    if (this.commands['ArrowUp'] || this.commands['w']) {
      this.center.y -= this.speed
      needNextFrameUpdate = true
    }
    if (this.commands['ArrowRight'] || this.commands['d']) {
      this.center.x += this.speed
      needNextFrameUpdate = true
    }
    if (this.commands['ArrowDown'] || this.commands['s']) {
      this.center.y += this.speed
      needNextFrameUpdate = true
    }
    if (this.commands['ArrowLeft'] || this.commands['a']) {
      this.center.x -= this.speed
      needNextFrameUpdate = true
    }
    return needNextFrameUpdate
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
    
    this.needUpdate = true
    this.tick = this.tick.bind(this)
  }
  drawBackground() {
    let ctx = this.ctx
    ctx.fillStyle = '#2d3142'
    ctx.fillRect(0, 0, this.dimension.width, this.dimension.height)
  }
  doDraw() {
    this.drawBackground()
    this.border.draw()
    this.player.draw()
  }
  keyDown(key) {
    this.player.keyDown(key)
    this.needUpdate = true
  }
  keyUp(key) {
    this.player.keyUp(key)
    this.needUpdate = true
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
    return false
  }
  nextState() {
    let needNextFrameUpdate = false
    needNextFrameUpdate ||= this.player.nextState()
    this.checkCollision()
    return needNextFrameUpdate
  }
  tick() {
    if (this.needUpdate) {
      this.needUpdate = this.nextState()
      this.draw()
    }
    window.requestAnimationFrame(this.tick)
  }
  start() {
    this.tick()
  }
}

function bindKeys(game) {
  window.addEventListener('keydown', function(event) {
    game.keyDown(event.key)
  })
  window.addEventListener('keyup', function(event) {
    game.keyUp(event.key)
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
  bindKeys(game)
  game.start()
}

init()
