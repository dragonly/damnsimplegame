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
    // 没有按键说明状态不会变化, 直接跳过后续逻辑, 节省cpu时间
    // 如果游戏逻辑包含了物理模拟, 比如横版过关里面每一帧都需要根据加速度来移动player, 那么这一步就不能直接这么用了, 因为始终需要更新player
    if (this.states.downKeys.size === 0) return false


    let updated = this.player.stepState(this.states.downKeys)
    // 如果有多个game object需要stepState, 只要一个有变化就需要重绘整个游戏(可能有优化空间), 可以类似下列调用, 用 |= 操作符简化描述
    // updated |= this.border.stepState()
    // updated |= this.background.stepState()

    // 如果整个游戏状态更新完了, 发现没有变化, 那么不需要做碰撞检测, 节省cpu时间
    // 否则需要利用碰撞检测, 来纠正stepState中错误的更新
    // 比如player跑到了border里面, 需要利用碰撞检测来把player放回碰撞的边界
    // 还有更加复杂的碰撞检测和纠正机制, 这里暂时不涉及, 有兴趣的同学可以参考Real-Time Rendering这本书
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

    // requestAnimationFrame告诉浏览器下次重绘前执行this.boundFn.tick这个回调函数
    // 之所以要bind(this)是因为js里的function(){}里面的this是根据运行时变化的, 谁调用他谁就是this
    // 所以bind(this)使得this.boundFn.tick的this始终为Game实例
    window.requestAnimationFrame(this.boundFn.tick)
  }

  start() {
    this.tick()
  }
}


// 注册按键的监听函数, 这里以键盘为例, 同样可以监听鼠标事件如mousemove, 来实现基于鼠标的交互逻辑
// 回调函数的执行跟init()所在的"主线程"的执行可以理解为互不干扰的并行执行, 所以回调函数里面更改了game.states里面的东西
// init()函数运行到的game.stepState()函数也能看到. 回调函数由按键等事件触发, 跟具体代码逻辑无关, 可能在任何时间点发生回调
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
