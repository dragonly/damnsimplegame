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
}


class Player {
  constructor(ctx, props) {
    this.ctx = ctx
    this.keys = props.keys
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

  stepState(stepTime) {
    let keys = this.keys
    if (keys.has('ArrowUp') || keys.has('w')) {
      this.center.y -= this.speed
    }
    if (keys.has('ArrowRight') || keys.has('d')) {
      this.center.x += this.speed
    }
    if (keys.has('ArrowDown') || keys.has('s')) {
      this.center.y += this.speed
    }
    if (keys.has('ArrowLeft') || keys.has('a')) {
      this.center.x -= this.speed
    }
  }
}

function E(e) { throw e }

class ParticleSystem {
  constructor(ctx, props) {
    this.origin = props.origin || E('origin')

  }
}

class Vector {
  constructor(...v) {
    this.v = v
  }
}

class Game {
  constructor(ctx, props) {
    this.ctx = ctx

    this.controlState = {
      minFrameInterval: 1000 / 30,
      lastRafTime: 0,
      stepTime: 1000 / 60,
      accumulatedTime: 0,
      rafID: 0,
      started: false,
    }

    this.gameState = {
      downKeys: new Set()
    }

    this.childGameObjects = {}

    let dimension = props.dimension
    this.registerChildGO('background',
      new Background(ctx, {
        dimension
    }))

    let lineWidth = 20
    this.registerChildGO('border',
      new Border(ctx, {
        topLeft: {
          x: lineWidth / 2,
          y: lineWidth / 2
        },
        dimension: {
          width: dimension.width - lineWidth,
          height: dimension.height - lineWidth
        },
        width: lineWidth
    }))

    this.registerChildGO('player',
      new Player(ctx, {
        keys: this.gameState.downKeys,
        center: {
          x: dimension.width / 2,
          y: dimension.height / 2
        },
        width: 20,
        speed: 10
    }))
    
    this.boundedFn = {}
    this.boundedFn.tick = this.tick.bind(this)

    this.listenOnWindowEvents()
  }

  listenOnWindowEvents() {
    window.addEventListener('keydown', (event) => {
      this.gameState.downKeys.add(event.key)
    })
    window.addEventListener('keyup', (event) => {
      this.gameState.downKeys.delete(event.key)
    })
  }

  registerChildGO(name, child) {
    this.childGameObjects[name] = child
  }

  deregisterChildGO(name) {
    delete this.childGameObjects[name]
  }

  forEachChildGO(fn) {
    Object.keys(this.childGameObjects).forEach((key) => fn(this.childGameObjects[key]))
  }

  draw() {
    this.forEachChildGO((gameObject) => {
      if (typeof gameObject.draw === 'function') {
        gameObject.draw()
      }
    })
  }

  // FIXME
  checkCollision() {
    let player = this.childGameObjects.player
    let border = this.childGameObjects.border
    if (player.center.x - player.width / 2 < border.width) {
      player.center.x = border.width + player.width / 2
    }
    if (player.center.x + player.width / 2 > border.dimension.width) {
      player.center.x = border.dimension.width - player.width / 2
    }
    if (player.center.y - player.width / 2 < border.width) {
      player.center.y = border.width + player.width / 2
    }
    if (player.center.y + player.width / 2 > border.dimension.height) {
      player.center.y = border.dimension.height - player.width / 2
    }
    return false
  }

  stepState(stepTime) {
    if (this.gameState.downKeys.size === 0) return false

    this.forEachChildGO(function(gameObject) {
      if (typeof gameObject.stepState === 'function') {
        gameObject.stepState(stepTime)
      }
    })
    this.checkCollision()
  }

  tick(timestamp) {
    // console.log(`[requestAnimationFrame] ${this.controlState.rafID}`)
    this.controlState.rafID = window.requestAnimationFrame(this.boundedFn.tick)

    if (timestamp - this.controlState.lastRafTime < this.controlState.minFrameInterval) return

    this.controlState.accumulatedTime += timestamp - this.controlState.lastRafTime
    this.controlState.lastRafTime = timestamp

    while (this.controlState.accumulatedTime >= this.controlState.stepTime) {
      this.stepState(this.controlState.stepTime)
      this.controlState.accumulatedTime -= this.controlState.stepTime
    }

    this.draw()
  }

  start() {
    if (!this.controlState.started) {
      this.controlState.started = true
      this.controlState.rafID = window.requestAnimationFrame(function(timestamp) {
        this.draw()
        this.controlState.lastRafTime = timestamp
        this.controlState.rafID = window.requestAnimationFrame(this.boundedFn.tick)
      }.bind(this))
    }
  }

  stop() {
    this.controlState.started = false
    window.cancelAnimationFrame(this.controlState.rafID)
  }
}


function init() {
  let $canvas = document.getElementsByTagName('canvas')[0]
  $canvas.width = window.innerWidth
  $canvas.height = window.innerHeight

  // game is exported to global scop, so we can do `game.stop()` manually in console :D
  game = new Game(
    $canvas.getContext('2d'),
    {
      dimension: {
        width: $canvas.width,
        height: $canvas.height
      }
    }
  )
  game.start()
}


init()
