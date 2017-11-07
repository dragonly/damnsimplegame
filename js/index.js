class Background {
  constructor(ctx, props) {
    this.ctx = ctx
    this.dimension = props.dimension
  }

  draw() {
    let ctx = this.ctx
    ctx.fillStyle = '#2d3142'
    ctx.fillRect(0, 0, this.dimension.width, this.dimension.height)
  }

  stepState() { return true }
}


class Border {
  constructor(ctx, props) {
    this.ctx = ctx
    this.topLeft = props.topLeft
    this.dimension = props.dimension
    this.width = props.width
  }

  draw() {
    let ctx = this.ctx
    ctx.strokeStyle = '#4f5d75'
    ctx.lineWidth = this.width
    ctx.strokeRect(this.topLeft.x, this.topLeft.y, this.dimension.width, this.dimension.height)
  }

  stepState() { return true }
}


class Player {
  constructor(ctx, props) {
    this.ctx = ctx
    this.center = props.center
    this.width = props.width
    this.speed = props.speed
    this.commands = {}
  }

  draw() {
    let ctx = this.ctx
    ctx.strokeStyle = '#ef8354'
    ctx.lineWidth = this.width / 2
    ctx.strokeRect(this.center.x - this.width / 4, this.center.y - this.width / 4, this.width / 2, this.width / 2)
  }

  stepState(keys) {
    let updated = false
    if (keys.has('ArrowUp') || keys.has('w')) {
      this.center.y -= this.speed
      updated = true
    }
    if (keys.has('ArrowRight') || keys.has('d')) {
      this.center.x += this.speed
      updated = true
    }
    if (keys.has('ArrowDown') || keys.has('s')) {
      this.center.y += this.speed
      updated = true
    }
    if (keys.has('ArrowLeft') || keys.has('a')) {
      this.center.x -= this.speed
      updated = true
    }
    console.log(keys)
    console.log(updated)
    return updated
  }
}


class Game {
  constructor(ctx, dimension) {
    this.ctx = ctx
    this.dimension = dimension

    this.background = new Background(ctx, {
      dimension: dimension
    })

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
    
    this.boundFn = {}
    this.boundFn.tick = this.tick.bind(this)
    
    this.states = {
      downKeys: new Set(),
      needRedraw: true
    }
  }

  draw() {
    this.background.draw()
    this.border.draw()
    this.player.draw()
  }

  keyDown(key) {
    this.states.downKeys.add(key)
    // console.log(this.states.downKeys)
  }

  keyUp(key) {
    this.states.downKeys.delete(key)
    // console.log(this.states.downKeys)
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

  stepState() {
    if (this.states.downKeys.size === 0) return false

    let updated = this.player.stepState(this.states.downKeys)
    // dummy operations just to give the idea of `|=`
    // updated |= this.border.stepState()
    // updated |= this.background.stepState()
    if (updated) {
      this.checkCollision()
    }
    return updated
  }

  tick() {
    if (this.states.needRedraw) {
      this.draw()
    }
    this.states.needRedraw = this.stepState()
    window.requestAnimationFrame(this.boundFn.tick)
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
