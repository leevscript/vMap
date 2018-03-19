/**
 * Created by liw on 2018/1/26.
 */
export class Basic {
  constructor({el, width, height}) {
    this.canvas = el || document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.w = width
    this.h = height
    this.canvasRatio = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = this.getPixelRatioAdjustedSize(width)
    this.canvas.height = this.getPixelRatioAdjustedSize(height)
    this.canvas.style.width = width + 'px'
    this.canvas.style.height = height + 'px'
    this.resetCanvas()
  }

  resetCanvas() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.scale(this.canvasRatio, this.canvasRatio)
  }

  setHeight(h) {
    return this.h = h, this
  }

  setOffset(x = 0, y = 0) {
    return this.ctx.translate(x, y), this
  }

  getPixelRatioAdjustedSize(a) {
    return Math.round(a * this.canvasRatio)
  }

  getY(a, b, c, d) {
    return d * (c - a) / (c - b)
  }

  getControlPoint(a, b, c) {
    let d = 0
    return c[1] <= b[1] && a[1] <= b[1] || c[1] >= b[1] && a[1] >= b[1] || (d = c[1] - a[1]), [.2 * (c[0] - a[0]) + b[0], .2 * d + b[1]]
  }

  createGradient({min, max, fillColors, opacity}) {
    if (typeof fillColors === 'string') return fillColors
    for (var d, e, g = fillColors.length, h = fillColors[0][0], i = fillColors[g - 1][0],
           j = 1 / (i - h), k = this.h / (min - max), l = k * (i - max), m = k * (h - max),
           n = this.ctx.createLinearGradient(0, m, 0, l),
           o = 0; o < g; ++o)e = fillColors[o][1], d = j * (fillColors[o][0] - h), n.addColorStop(d, "rgba( " + e[0] + ", " + e[1] + ", " + e[2] + ", " + opacity + " )")
    return n
  }

  renderGraph({data, fillColors, min, max, opacity = 1, width = this.w, height = this.h, lineWidth = 1, strokeStyle = '#000'}) {
    var ctx = this.ctx
    var length = data.length
    var tdWidth = width / length
    var startX = -tdWidth - (tdWidth >> 1)
    var arr = []
    var d, i
    var minmax = this.findMinMax(data)
    min = min || minmax[0]
    max = max || minmax[1]
    this.checkData(data)
    for (i = 0; i < length + 4; ++i) {
      d = data[Math.max(0, Math.min(i - 2, length - 1))]
      arr.push([startX, this.getY(d, min, max, height), d])
      startX += tdWidth
    }
    for (i = 0; i < length; ++i) {
      arr[i + 2][1] = .6 * arr[i + 2][1] + .15 * (arr[i + 1][1] + arr[i + 3][1]) + .05 * (arr[i][1] + arr[i + 4][1])
    }
    ctx.beginPath()
    ctx.moveTo(arr[1][0], height)
    ctx.lineTo(arr[1][0], arr[1][1])
    for (i = 0; i < length + 1; ++i) {
      var p = this.getControlPoint(arr[i], arr[i + 1], arr[i + 2])
      var q = this.getControlPoint(arr[i + 3], arr[i + 2], arr[i + 1])
      ctx.bezierCurveTo(p[0], p[1], q[0], q[1], arr[i + 2][0], arr[i + 2][1])
    }
    ctx.lineTo(arr[length + 2][0], height)
    if (fillColors) {
      ctx.fillStyle = this.createGradient({min, max, fillColors, opacity})
      ctx.fill()
    } else {
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = strokeStyle
      ctx.stroke()
    }
    return this
  }

  findMinMax(arr) {
    return [Math.min.apply(Math, arr), Math.max.apply(Math, arr)]
  }

  checkData(arr) {
    for (var val, tmp = arr[0] || 0, i = 0; i < arr.length; i++) {
      val = arr[i]
      null === val || isNaN(val) || void 0 === val ? arr[i] = tmp : tmp = val
    }
  }

  renderImage(img) {

  }
}

export class Meteogram extends Basic {
  constructor(option) {
    super(option)
    this.cLine = 'rgba(0,0,0,0.1)'
    this.cText = 'rgba(31, 26, 58, 1)'
    this.font = '10px Verdana'
    this.hrParsAlt1 = [-70, .038, 6]
    this.hrParsAlt0 = [-60, .025, 4]
    this.hrLerpFactorPow = 1
    this.hrPow2 = .7
    this.hrAltName = [null, '950h', '925h', '900h', '850h', '800h', '700h', '600h', '500h', '400h', '300h', '200h', '150h', null]
    this.hrAlt = [0, 5, 11, 16.7, 25, 33.4, 50, 58.4, 66.7, 75, 83.3, 92, 98, 100]
    this.txAlt = ['', '900h 900m 3000ft', '800h 2km 6400ft', '700h 3km FL100', '500h 5km FL180', '300h 9km FL300']
  }

  lerp(t, e, i) {
    return t + i * (e - t)
  }

  cubicHermite(t, e, i, a, s) {
    return (.5 * -t + 3 * e * .5 - 3 * i * .5 + .5 * a) * s * s * s + (t - 5 * e * .5 + 2 * i - .5 * a) * s * s + (.5 * -t + .5 * i) * s + e
  }

  bicubicFiltering(t, e, i) {
    return this.cubicHermite(this.cubicHermite(t[0], t[1], t[2], t[3], e), this.cubicHermite(t[4], t[5], t[6], t[7], e), this.cubicHermite(t[8], t[9], t[10], t[11], e), this.cubicHermite(t[12], t[13], t[14], t[15], e), i)
  }

  clamp0X(t, e) {
    return Math.min(Math.max(t, 0), e - 1)
  }

  prepareStepLut() {
    var t = this
    this.clut = new Uint8Array(256)
    for (var e = 0; e < 160; e++)t.clut[e] = t.clamp0X(24 * Math.floor((e + 12) / 16), 160)
  }

  step(t) {
    return this.clut[Math.floor(this.clamp0X(t, 160))]
  }

  legend() {
    var t, e, i = this, a = this.ctx, s = this.h, n = s / 6, o = 0
    a.font = this.font
    a.fillStyle = this.cText
    a.setLineDash([4, 4])
    a.lineWidth = 1
    a.strokeStyle = this.cLine
    a.beginPath()
    for (t = 1; t < 6; t++) {
      for (s -= n, e = 0; e < 2; e++) {
        o = 0
        e && (o = i.w, a.moveTo(0, s), a.lineTo(i.w, s))
        a.textAlign = e ? "right" : "left"
        a.fillText(" " + i.txAlt[t] + " ", o, s + 8 + 2)
      }
    }
    a.stroke(), a.setLineDash([])
  }

  renderMeteogram({data, width = this.w, height = this.h}) {
    var e, i, a, s, n, o, l, d, r, c, h,
      g = data,
      m = this,
      w = g["rh-1000h"].length,
      p = this.getPixelRatioAdjustedSize(this.w / w),
      b = this.getPixelRatioAdjustedSize(this.w),
      u = this.getPixelRatioAdjustedSize(this.h),
      f = this,
      v = w,
      x = w - v,
      y = w,
      k = f.hrAltName.length,
      W = y - x, T = W * k,
      M = new Float32Array(T + T),
      D = 0
    for (i = 0; i < k; ++i) {
      if (null == f.hrAltName[i]) {
        for (e = x; e < y; ++e) {
          M[D++] = 0
          M[D++] = 0
        }
      } else {
        a = "rh-" + f.hrAltName[i]
        s = g[a]
        n = .01 * f.hrAlt[i]
        o = f.lerp(m.hrParsAlt0[0], m.hrParsAlt1[0], n)
        l = f.lerp(m.hrParsAlt0[1], m.hrParsAlt1[1], n)
        d = f.lerp(m.hrParsAlt0[2], m.hrParsAlt1[2], n)
        r = 1 - .8 * Math.pow(n, m.hrPow2)
        for (e = x; e < y; ++e) {
          c = Number(s[e])
          h = Math.max(0, Math.min((c + o) * l, 1))
          h = Math.pow(h, d) * r
          M[D++] = h
          M[D++] = c
        }
      }
    }
    var L = document.createElement("canvas")
    L.width = this.w
    L.height = u
    var C,
      S = L.getContext("2d"),
      E = S.getImageData(0, 0, b, u),
      A = E.data,
      H = .01 * (u - 1),
      P = u,
      z = p + 1 >> 1,
      N = u + u,
      I = new Int32Array(N),
      R = new Float32Array(16)
    void 0 === this.clut && this.prepareStepLut()
    var _, O, F, B, U, q, G, X, j, V, $, Y, Z, J, K, Q, tt, et, it, at, st, nt
    for (i = 0; i < k - 1; ++i) {
      C = P
      P = Math.round(u - 1 - f.hrAlt[i + 1] * H)
      _ = W + W, O = _ * m.clamp0X(i + 2, k)
      F = _ * m.clamp0X(i + 1, k)
      B = _ * m.clamp0X(i + 0, k)
      U = _ * m.clamp0X(i - 1, k)
      q = 0
      G = z
      X = C - P
      j = 1 / X
      for (e = 0; e < W + 1; ++e) {
        V = 2 * m.clamp0X(e - 2, W)
        $ = 2 * m.clamp0X(e - 1, W)
        Y = 2 * m.clamp0X(e + 0, W)
        Z = 2 * m.clamp0X(e + 1, W)
        R[0] = M[O + V]
        R[1] = M[O + $]
        R[2] = M[O + Y]
        R[3] = M[O + Z]
        R[4] = M[F + V]
        R[5] = M[F + $]
        R[6] = M[F + Y]
        R[7] = M[F + Z]
        R[8] = M[B + V]
        R[9] = M[B + $]
        R[10] = M[B + Y]
        R[11] = M[B + Z]
        R[12] = M[U + V]
        R[13] = M[U + $]
        R[14] = M[U + Y]
        R[15] = M[U + Z]
        J = G - q
        K = 1 / J
        Q = 4 * (P * b + q)
        if (0 === e && X > 0) {
          for (tt = 1 / X, et = 0; et < X; et++)I[--N] = i
          I[--N] = Math.round(1e4 * tt * et)
        }
        for (it = 0; it < X; ++it) {
          at = Q + it * b * 4
          for (st = 0; st < J; ++st) {
            nt = m.step(160 * f.bicubicFiltering(R, K * st, j * it))
            A[at++] = 255 - nt
            A[at++] = 255 - nt
            A[at++] = 255 - nt
            A[at++] = nt > 10 ? 255 : 0;
          }
        }
        q = G, G += p, G > b && (G = b)
      }
    }
    return S.putImageData(E, 0, 0), this.ctx.drawImage(L, 0, 0, width, height), this.legend(), this
  }
}

export class Airgram extends Basic {
  constructor(option) {
    super(option)
    this.altN = ["1000h", "950h", "925h", "900h", "850h", "800h", "700h", "600h", "500h", "400h", "300h", "200h", "150h"]
    this.alt = [1e3, 950, 925, 900, 850, 800, 700, 600, 500, 400, 300, 200, 150]
    this.step = 5
    this.K0 = 273.15
    this.KMin = 193
    this.pdata = null
    this.colorBg = "rgba(255,255,255,1)"
    this.colorWind = "rgba(0, 0, 0, 0.90)"
    this.colorNoWind = "rgba(0, 0, 0, 0.20)"
    this.colorTemp = "rgba(255, 255, 255, 0.8)"
    this.colorLegend = "rgba(32, 32, 32, 0.50)"
    this.colorHLines = "rgba(0, 0, 0, 0.20)"
  }

  lerpColor256() {
    for (var h = t.length, e = [], a = 0; a < h; ++a)
      e.push(Math.min(Math.max(0, Math.round(t[a] + r * (i[a] - t[a]))), 255));
    return e
  }

  prepareStepColors() {
    var t = []
      , i = this.step
      , r = 1 + Math.floor((this.K0 - this.KMin) / i)
      , e = this.K0 - i * r
      , a = h
      , s = a.length;
    for (this.tmin_ = e,
           e += .5 * i; e < 328;) {
      for (var n = 1; n < s; ++n)
        if (e < a[n][0]) {
          var o = (e - a[n - 1][0]) / (a[n][0] - a[n - 1][0]);
          t.push(this.lerpColor256(this.lerpColor256(a[n - 1][1], a[n][1], o), [160, 160, 160, 255], .3));
          break
        }
      e += i
    }
    this.n0_ = r - 1,
      this.n1_ = r,
      this.steps_ = t
  }

  renderAirgram(t) {
    this.steps_ || this.prepareStepColors();
    for (var i = this.getPixelRatioAdjustedSize(this.h), r = this.getPixelRatioAdjustedSize(this.tdWidth),
           h = t.data, e = h["temp-1000h"].length, a = this.altN.length, s = e * a, n = new Float32Array(s), o = 0,
           l = 0; l < a; ++l)
      for (var d = "temp-" + this.altN[l], f = h[d], m = 0; m < e; ++m)
        n[o++] = Number(f[m]);
    var p = this.renderTemp(e, a, r, i, n);
    this.legend(e, a, this.tdWidth, this.h);
    var u = new Float32Array(s + s);
    for (o = 0,
           l = 0; l < a; ++l) {
      var c = "wind_u-" + this.altN[l]
        , g = "wind_v-" + this.altN[l]
        , v = h[c]
        , _ = h[g];
      for (m = 0; m < e; ++m)
        u[o++] = Number(v[m]),
          u[o++] = Number(_[m])
    }
    return this.renderWind(e, a, this.tdWidth, this.h, u),
      this.preparePData(e, a, this.tdWidth, this.w, this.h, p, h, n, u),
      this
  }

  edge(t, i, r) {
    var h = [t[r - 1 - i], t[r - i], t[r + 1 - i], t[r - 1], t[r], t[r + 1], t[r - 1 + i], t[r + i], t[r + 1 + i]]
      , e = 0;
    h[1] != h[7] && (e += 2),
    h[3] != h[5] && (e += 2),
    h[0] != h[6] && (e += 1),
    h[2] != h[8] && (e += 1),
    h[0] != h[2] && (e += 1),
    h[6] != h[8] && (e += 1);
    for (var a = !1, s = !1, n = 0; n < h.length; n++)
      h[n] == this.n0_ && (a = !0),
      h[n] == this.n1_ && (s = !0);
    return e = a && s ? Math.min(2 + 48 * e, 128) : Math.max(1 - .03 * e, .05)
  }

  renderTemp(t, i, r, h, e) {
    for (var a, s = this.ctx, n = -this.tmin_, o = 1 / this.step, l = t * r, d = s.createImageData(l, h),
           f = d.data, m = l * h, p = new Uint8Array(m), u = (h - 1) / 850, c = h, g = r + 1 >> 1, v = h + h,
           _ = new Int32Array(v), M = 0; M < i - 1; ++M) {
      a = c,
        c = Math.round((this.alt[M + 1] + -150) * u);
      for (var y = t * this.clamp0X(M + 2, i), W = t * this.clamp0X(M + 1, i), A = t * this.clamp0X(M + 0, i),
             b = t * this.clamp0X(M - 1, i), w = 0, x = g, T = a - c, N = 1 / T, k = 0; k < t + 1; ++k) {
        for (var P = this.clamp0X(k - 2, t), S = this.clamp0X(k - 1, t), L = this.clamp0X(k + 0, t),
               X = this.clamp0X(k + 1, t),
               C = [e[y + P], e[y + S], e[y + L], e[y + X], e[W + P], e[W + S], e[W + L], e[W + X], e[A + P], e[A + S], e[A + L], e[A + X], e[b + P], e[b + S], e[b + L], e[b + X]],
               D = x - w, I = 1 / D, K = c * l + w, R = 0; R < T; ++R) {
          0 == k && (_[--v] = M,
            _[--v] = Math.round(R * N * 1e4));
          for (var H = K + R * l, F = 0; F < D; ++F) {
            var j = this.bicubicFiltering(C, I * F, N * (R + 0))
              , q = Math.floor((j + n) * o);
            p[H++] = q
          }
        }
        w = x,
          x += r,
        x > l && (x = l)
      }
    }
    var z = 0;
    for (M = 0; M < h; M++)
      for (k = 0; k < l; k++) {
        H = M * l + k;
        var V = 1;
        M > 0 && M < h - 1 && k > 0 && k < l - 1 && (V = this.edge(p, l, H));
        var B = this.steps_[p[H]];
        B || (B = [0, 0, 0]),
          V < .99 ? (f[z++] = Math.round(B[0] * V),
            f[z++] = Math.round(B[1] * V),
            f[z++] = Math.round(B[2] * V)) : V > 2 ? (f[z++] = Math.min(B[0] + V, 255),
            f[z++] = Math.min(B[1] + V, 255),
            f[z++] = Math.min(B[2] + V, 255)) : (f[z++] = B[0],
            f[z++] = B[1],
            f[z++] = B[2]),
          f[z++] = 255
      }
    s.putImageData(d, 0, 0);
    var U, E, G = 2;
    for (F = r * G,
           T = 12,
           s.fillStyle = this.colorTemp,
           s.textAlign = "center",
           s.font = "8px Verdana"; G < t;) {
      for (k = F,
             c = 0,
             R = 0; R < h - T / 2; R++)
        U = p[k],
        E >= 0 && E != U && R - c > T && (s.fillText(this.convertTemp(Math.round(this.tmin_ + Math.max(U, E) * this.step)) + "°", F / this.canvasRatio, (R + .35 * T) / this.canvasRatio),
          c = R),
          E = U,
          k += l;
      G += 4,
        F += 4 * r
    }
    return _
  }

  windMark(t, i, r, h, e, a) {
    h = -h;
    var s = Math.sqrt(h * h + e * e)
      , n = Math.round(.388768 * s)
      , o = .17 * a
      , l = .35 * a;
    if (n > 0) {
      var d = h / s
        , f = e / s
        , m = d * o * .5 - f * l
        , p = f * o * .5 + d * l
        , u = -o * d
        , c = -o * f;
      if (t.strokeStyle = t.fillStyle = this.colorWind,
          t.beginPath(),
          t.moveTo(i, r),
          i += d * a,
          r += f * a,
          t.lineTo(i, r),
        1 == n && (i += u,
          r += c),
        n >= 10) {
        for (; n >= 10;)
          n -= 10,
            t.lineTo(i + u + m, r + c + p),
            t.lineTo(i + u, r + c),
            t.fill(),
            i += u,
            r += c;
        i += u,
          r += c
      }
      for (; n > 0;) {
        t.moveTo(i, r);
        var g = 1 == n ? .5 : 1;
        t.lineTo(i + m * g, r + p * g),
          i += u,
          r += c,
          n -= 2
      }
      t.stroke()
    } else
      t.strokeStyle = t.fillStyle = this.colorNoWind,
        t.beginPath(),
        t.arc(i, r, .07 * a, 0, 2 * Math.PI, !1),
        t.stroke(),
        t.beginPath(),
        t.arc(i, r, .16 * a, 0, 2 * Math.PI, !1),
        t.stroke()
  }

  renderWind(t, i, r, h, e) {
    var a, s, n, o, l, d, f, m, p = this.ctx, u = (h - 1) / 850, c = r + 1 >> 1, g = .65 * r, v = .46 * r,
      _ = .4 * r;
    p.lineWidth = 1;
    for (var M = 0; M < i; ++M)
      if (s = Math.round((this.alt[M] + -150) * u),
          f = this.altN[M],
          !/925h|150h/.test(f))
        for (l = 0; l < t; ++l)
          a = c + r * l,
            d = M * t + l << 1,
            n = e[d],
            o = e[d + 1],
            m = /1000h/.test(f) ? _ : 0 === l && n < 0 || l === t - 1 && n > 0 ? v : g,
            this.windMark(p, a, s, n, o, m)
  }

  legend(t, i, r, h) {
    var e, a, s, n, o, l = this.ctx, d = (h - 1) / 850;
    for (l.fillStyle = this.colorLegend,
           l.font = "9px Verdana",
           l.setLineDash([2, 4]),
           l.lineWidth = this.canvasRatio,
           l.strokeStyle = this.colorHLines,
           l.beginPath(),
           s = 0; s < 2; s++)
      for (l.textAlign = s ? "right" : "left",
             o = 0 === s ? 2 : this.w - 2,
             a = 0; a < this.altN.length - 1; a++)
        "925h" !== (n = this.altN[a]) && (e = Math.round((this.alt[a] + -150) * d),
          l.fillText(n, o, e + 3),
        s && a && (l.moveTo(30, e),
          l.lineTo(this.w - 30, e)));
    l.stroke(),
      l.setLineDash([])
  }

  convertTemp(t) {
    return Math.round(i.temp.convertNumber(t))
  }

  preparePData(t, i, r, h, e, a, s, n, o) {
    this.nx_ = t,
      this.ny_ = i,
      this.segmentWidth_ = r,
      this.imgWidth_ = h,
      this.imgHeight_ = e,
      this.hLut_ = a,
      this.tempArray_ = n,
      this.windArray_ = o
  }
}

