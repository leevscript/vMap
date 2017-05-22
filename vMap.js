;(function (window) {
    function vMap(opation) {
        var _this = this
        this.canvas = opation.canvas
        this.ctx = this.canvas.getContext('2d')
        this.src = opation.src || ''
        this.points = opation.points
        this.area = opation.area
        this.success = opation.success
        this.container = opation.container || this.canvas.parentNode
        this.cache = {}
        this.init()
        this.canvas.addEventListener('click', function (event) {
            _this.init(event)
        })
    }

    vMap.prototype = {
        constructor: vMap,
        init: function (event) {
            var _this = this
            event = event || {}
            this.initMap(function () {
                _this.initScroll()
                _this.initIcons(event)
                _this.initArea(event)
                if (_this.success) _this.success()
            })

        },
        initMap: function (callback) {
            var _this = this, map = _this.cache['map']
            if (!map) {
                map = new Image()
                map.src = this.src
                this.ctx.clearRect(0, 0, map.width, map.height)
                map.onload = function () {
                    _this.cache['map'] = map
                    _this.drawMap(map, callback)
                }
            } else {
                this.ctx.clearRect(0, 0, map.width, map.height)
                _this.drawMap(map, callback)
            }
        },
        drawMap: function (map, callback) {
            this.ctx.beginPath()
            this.canvas.width = map.width
            this.canvas.height = map.height
            this.ctx.drawImage(map, 0, 0)
            if (callback) callback()
        },
        initIcons: function (event) {
            var _this = this
            if (!_this.points) return
            if (_this.cache.ready) {
                _this.drawIcons(event)
            } else {
                _this.loadIcons(function () {
                    _this.drawIcons(event)
                })
            }

        },
        loadIcons: function (callback) {
            var _this = this, resource = [], count = 0, icon
            _this.points.forEach(function (v) {
                if (resource.indexOf(v.src) === -1) resource.push(v.src)
            })
            resource.forEach(function (v) {
                icon = new Image()
                icon.src = v
                _this.cache[v] = icon
                icon.onload = function () {
                    count++
                    if (count === resource.length) {
                        _this.cache.ready = true
                        callback()
                    }
                }
            })
        },
        drawIcons: function (event) {
            var _this = this
            _this.points.forEach(function (point) {
                var icon = _this.cache[point.src]
                icon.offsetX = point.x - icon.width / 2
                icon.offsetY = point.y - icon.height / 2
                icon.centerX = point.y
                icon.centerY = point.y
                icon.pageX = event.pageX
                icon.pageY = event.pageY
                _this.ctx.beginPath()
                _this.ctx.drawImage(icon, icon.offsetX, icon.offsetY)
                _this.ctx.rect(icon.offsetX, icon.offsetY, icon.width, icon.height)
                if (_this.ctx.isPointInPath(event.offsetX, event.offsetY)) {
                    if (point.callback) point.callback(icon)
                }
            })
        },
        initArea: function (event) {
            var _this = this
            if (!_this.area) return
            _this.area.forEach(function (dots) {
                dots.location.forEach(function (dot, index) {
                    if (index === 0) {
                        _this.ctx.beginPath()
                        _this.ctx.fillStyle = 'rgba(255,0,0,0.25)'
                        _this.ctx.moveTo(dot.x, dot.y)
                    } else {
                        _this.ctx.lineTo(dot.x, dot.y)
                    }
                })
                _this.ctx.fill()
                _this.ctx.closePath()
                if (_this.ctx.isPointInPath(event.offsetX, event.offsetY)) {
                    if (dots.callback) dots.callback(event)
                }
            })
        },
        initScroll: function () {
            var _this = this,
                _window = window,
                _document = document
            var newScrollX, newScrollY

            var dragged = _this.container
            var reset = function (el) {
                el = dragged
                el.removeEventListener('mousedown', el.md, 0);
                _window.removeEventListener('mouseup', el.mu, 0);
                _window.removeEventListener('mousemove', el.mm, 0);

                (function (el, lastClientX, lastClientY, pushed, scroller, cont) {
                    (cont = el.container || el).addEventListener(
                        'mousedown',
                        cont.md = function (e) {
                            if (!el.hasAttribute('nochilddrag') ||
                                _document.elementFromPoint(
                                    e.pageX, e.pageY
                                ) == cont
                            ) {
                                pushed = 1;
                                lastClientX = e.clientX;
                                lastClientY = e.clientY;

                                e.preventDefault();
                            }
                        }, 0
                    );

                    _window.addEventListener(
                        'mouseup', cont.mu = function () {
                            pushed = 0;
                        }, 0
                    );

                    _window.addEventListener(
                        'mousemove',
                        cont.mm = function (e) {
                            if (pushed) {
                                (scroller = el.scroller || el).scrollLeft -=
                                    newScrollX = (-lastClientX + (lastClientX = e.clientX));
                                scroller.scrollTop -=
                                    newScrollY = (-lastClientY + (lastClientY = e.clientY));
                                if (el == _document.body) {
                                    (scroller = _document.documentElement).scrollLeft -= newScrollX;
                                    scroller.scrollTop -= newScrollY;
                                }
                            }
                        }, 0
                    );
                })(dragged)
            }

            if (_document.readyState == 'complete') {
                reset();
            } else {
                _window.addEventListener('load', reset, 0);
            }


        }
    }

    vMap.Area = function (opation) {
        this.map = opation.map
        this.strokeStyle = opation.border || 'rgb(255,0,0)'
        this.fillStyle = opation.background || 'rgba(255,0,0,0.25)'
        this.path = null
        this.shade = null
        this.init()
    }

    vMap.Area.prototype = {
        constructor: vMap.Area,
        init: function () {
            this.initShade()
            this.initBoard()
        },
        initShade: function () {
            var shade = this.shade = document.createElement('div')
            shade.style.width = this.map.cache['map'].width + 'px'
            shade.style.height = this.map.cache['map'].height + 'px'
            shade.style.position = 'absolute'
            shade.style.left = 0
            shade.style.top = 0
            shade.style.backgroundColor = 'rgba(0,0,0,.05)'
            this.map.container.appendChild(shade)
        },
        initBoard: function () {
            var _this = this
            var path = _this.path = []
            this.shade.addEventListener('contextmenu', function (e) {
                if (path.length > 0) {
                    path.pop()
                    _this.drawing(path)
                }
                e.preventDefault()
            })
            this.shade.addEventListener('click', function (e) {
                path.push({x: e.offsetX, y: e.offsetY})
                _this.drawing(path)
            })
        },
        drawing: function (dots, flag) {
            var _this = this
            var ctx = this.map.ctx
            this.map.init()
            if (!dots || dots.length < 1) return
            dots.forEach(function (dot, index) {
                if (index === 0) {
                    ctx.beginPath()
                    ctx.fillStyle = _this.strokeStyle
                    ctx.arc(dot.x, dot.y, 2, 0, 2 * Math.PI)
                    ctx.fill()
                    ctx.closePath()
                    ctx.beginPath()
                    ctx.strokeStyle = _this.strokeStyle
                    ctx.fillStyle = _this.fillStyle
                    ctx.moveTo(dot.x, dot.y)
                } else {
                    ctx.lineTo(dot.x, dot.y)
                }
            })
            if (flag) {
                ctx.closePath()
                return ctx.fill()
            }
            ctx.stroke()
        },
        changeColor: function (opation) {
            this.strokeStyle = opation.border
            this.fillStyle = opation.background
            this.drawing(this.path)
        },
        save: function (callback) {
            if (!this.shade || !this.path || this.path.length < 2) return
            this.drawing(this.path, true)
            if (callback) callback(this.path)
        },
        destory: function (callback) {
            if (!this.shade) return
            this.map.container.removeChild(this.shade)
            this.map.init()
            this.shade = null
            this.path = null
            if (callback) callback()
        }
    }


    window.vMap = vMap
})(window)