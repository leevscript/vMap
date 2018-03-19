/**
 * @author: leevscript@163.com
 * @description:
 * @Date: 2018/1/7 2:29
 */
import utils from './utils'

export default class Color {
  constructor(a, b, c) {
    this.ident = a
    this.steps = b
    this.gradient = c
    this.colors = null
    this.setMinMax()
  }

  setColors(b) {
    this.wasModified || (this.defaultGradient = utils.clone(this.gradient)), this.wasModified = !0, this.gradient = b, this.setMinMax(), this.colors && this.forceGetColor()
  }

  toDefault() {
    this.defaultGradient && (this.wasModified = !1, this.gradient = utils.clone(this.defaultGradient), this.setMinMax(), this.colors && this.forceGetColor())
  }

  setMinMax() {
    this.min = this.gradient[0][0], this.max = this.gradient[this.gradient.length - 1][0]
  }

  forceGetColor() {
    return this.colors = null, this.getColor()
  }

  color(b, c, d) {
    let a = this.RGBA(b)
    return "rgba(" + a[0] + "," + a[1] + "," + a[2] + "," + (c || a[3] / (d || 256)) + ")"
  }

  colorRGB(a) {
    let b = this.RGBA(a)
    return "rgb( " + b[0] + ", " + b[1] + ", " + b[2] + ")"
  }

  colorDark(a, b) {
    let c = this.RGBA(a)
    return "rgba(" + (c[0] - b) + "," + (c[1] - b) + "," + (c[2] - b) + ",1)"
  }

  RGBA(a) {
    let b = this.value2index(a)
    return [this.colors[b], this.colors[++b], this.colors[++b], this.colors[++b]]
  }

  getMulArray(a, b) {
    let c, d = [], e = a.length
    for (c = 0; c < e; c++) d.push(a[c] * b)
    return d
  }

  lerpArray(a, b, c) {
    let d, e = 1 - c, f = a.length, g = []
    for (d = 0; d < f; d++) g.push(a[d] * e + b[d] * c)
    return g
  }

  rgb2yuv(a) {
    let b = [], c = .299 * a[0] + .587 * a[1] + .114 * a[2]
    return b.push(c), b.push(.565 * (a[2] - c)), b.push(.713 * (a[0] - c)), b.concat(a.slice(3))
  }

  yuv2rgb(a) {
    let b = [a[0] + 1.403 * a[2], a[0] - .344 * a[1] - .714 * a[2], a[0] + 1.77 * a[1]]
    return b.concat(a.slice(3))
  }

  gradYuv(a, b, c, d) {
    let e = this.lerpArray(a, b, c)
    if (d) {
      let f = this.vec2size(a[1], a[2]), g = this.vec2size(b[1], b[2])
      if (f > .05 && g > .05) {
        let h = this.vec2size(e[1], e[2]), i = f * (1 - c) + g * c
        if (h > .01) {
          let j = i / h
          e[1] *= j, e[2] *= j
        }
      }
    }
    return e
  }

  vec2size(a, b) {
    return Math.sqrt(a * a + b * b)
  }

  getGradientColor(a, b, c, d, e) {
    let f, g = 1 / 255, h = 1, i = 256
    switch (a) {
      case"YUV":
        let j = !0,
          k = this.gradYuv(this.rgb2yuv(this.getMulArray(b, g)), this.rgb2yuv(this.getMulArray(c, g)), d, j)
        f = this.yuv2rgb(k)
        break
      default:
        f = this.lerpArray(b, c, d), h = g, i = 1
    }
    for (let l = f[3] * h, m = 0; m < 4; m++) {
      let n = f[m]
      e && m < 3 && (n *= l), f[m] = Math.max(0, Math.min(n * i, 255))
    }
    return f
  }

  createGradientArray(a, b, c, d, e) {
    let f = this
    d = d || this.steps, e = e || 1
    let g, h, i, j, k, l, m = Uint8Array, n = new m(4 * (d + (b ? 1 : 0))), o = (this.max - this.min) / d, p = 0,
      q = this.gradient, r = 1, s = q[0], t = q[r++]
    for (i = 0; i < d; i++) for (k = (f.min + o * i) * e, k > t[0] && r < q.length && (s = t, t = q[r++]), g = k - s[0], l = g / (t[0] - s[0]), h = f.getGradientColor(a, s[1], t[1], l, c), j = 0; j < 4; j++) n[p++] = h[j]
    if (b) for (this.neutralGrayIndex = p, j = 0; j < 4; j++) n[p++] = 130
    return n
  }

  getColor() {
    return this.colors ? this : (this.colors = this.createGradientArray("YUV", !0), this.startingValue = this.min, this.step = (this.max - this.startingValue) / this.steps, this.value2index = function (a) {
      5.728447
      return isNaN(a) ? this.neutralGrayIndex : Math.max(0, Math.min(4 * (this.steps - 1), (a - this.startingValue) / this.step << 2))
    }, this)
  }
}
