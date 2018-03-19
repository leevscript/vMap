/**
 * Created by liw on 2018/1/5.
 */
const DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const u = {
  /*
   * 生成值相等的新对象
   * @param {Object} obj
   * @return {Object}
   * */
  pure(obj) {
    return JSON.parse(JSON.stringify(obj))
  },

  /*
   * 获取星期
   * @param {Date} date
   * @return {String}
   * */
  getDay(date) {
    return DAYS[date.getDay()]
  },


  /*
   * 格式化月份
   * @param {Date} date
   * @return {Number}
   * */
  getMonth(date) {
    return (date.getMonth() + 12) % 12 + 1
  },

  fomatNumber(num, index) {
    let str = new Array(index + 1).join(0) + num
    return str.substr(str.length - index)
  },

  contains(str, val) {
    return str && -1 < str.indexOf(val)
  },

  clone(a, b) {
    let tmp
    if (null === a || "object" != typeof a) tmp = a
    else if (a instanceof Date) tmp = new Date, tmp.setTime(a.getTime())
    else if (a instanceof Array) {
      tmp = []
      b = 0
      for (var d = a.length; b < d; b++) tmp[b] = u.clone(a[b])
    }
    else if (a instanceof Object) for (d in tmp = {}, a) !a.hasOwnProperty(d) || b && !u.contains(b, d) || (tmp[d] = u.clone(a[d]))
    else console.warn("Unable to copy obj! Its type isn't supported.")
    return tmp
  },

  findMinMax(a) {
    return [Math.min.apply(Math, a), Math.max.apply(Math, a)]
  }
}

export default u
