// ==============================
// 生成唯一文件名
// ==============================
function getFileName(ext = 'jpg') {
  return Date.now() + '_' + Math.floor(Math.random() * 10000) + '.' + ext
}

// ==============================
// 提取base64数据
// ==============================
function dataUrlToBase64(base64) {
  return base64.split(',')[1]
}

// ==============================
// 图片路径 → base64
// ==============================
export function pathToBase64(path) {
  return new Promise((resolve, reject) => {

    if (!path) {
      reject(new Error('invalid path'))
      return
    }

    // 已经是base64
    if (path.indexOf('data:image/') === 0) {
      resolve(path)
      return
    }

    // ======================
    // 微信小程序
    // ======================
    if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {

      const fs = wx.getFileSystemManager()

      // http://tmp 或 wxfile://
      if (
        path.indexOf('http://tmp/') === 0 ||
        path.indexOf('wxfile://') === 0
      ) {

        fs.readFile({
          filePath: path,
          encoding: 'base64',
          success(res) {
            resolve('data:image/jpeg;base64,' + res.data)
          },
          fail: reject
        })

        return
      }

      // 网络图片
      if (
        path.indexOf('http://') === 0 ||
        path.indexOf('https://') === 0
      ) {

        wx.downloadFile({
          url: path,
          success(dRes) {

            if (dRes.statusCode !== 200) {
              reject(new Error('download fail'))
              return
            }

            fs.readFile({
              filePath: dRes.tempFilePath,
              encoding: 'base64',
              success(res) {
                resolve('data:image/jpeg;base64,' + res.data)
              },
              fail: reject
            })

          },
          fail: reject
        })

        return
      }

      // 普通本地文件
      fs.readFile({
        filePath: path,
        encoding: 'base64',
        success(res) {
          resolve('data:image/jpeg;base64,' + res.data)
        },
        fail: reject
      })

      return
    }

    // ======================
    // H5
    // ======================
    if (typeof window === 'object') {

      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = function () {

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = img.width
        canvas.height = img.height

        ctx.drawImage(img, 0, 0)

        const base64 = canvas.toDataURL('image/jpeg')

        resolve(base64)
      }

      img.onerror = reject
      img.src = path

      return
    }

    // ======================
    // APP
    // ======================
    if (typeof plus === 'object') {

      plus.io.resolveLocalFileSystemURL(path, entry => {

        entry.file(file => {

          const reader = new plus.io.FileReader()

          reader.onload = e => {
            resolve(e.target.result)
          }

          reader.onerror = reject

          reader.readAsDataURL(file)

        })

      }, reject)

      return
    }

    reject(new Error('not support'))
  })
}

// ==============================
// base64 → 本地图片路径
// ==============================
export function base64ToPath(base64, fileName) {

  return new Promise((resolve, reject) => {

    if (!base64) {
      reject(new Error('base64 is empty'))
      return
    }

    const format = base64.match(/data:image\/(\w+);base64,/)

    if (!format) {
      reject(new Error('base64 format error'))
      return
    }

    const ext = format[1]
    fileName = fileName || getFileName(ext)

    // ======================
    // 微信小程序
    // ======================
    if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {

      const fs = wx.getFileSystemManager()

      const filePath = wx.env.USER_DATA_PATH + '/' + fileName

      fs.writeFile({
        filePath: filePath,
        data: dataUrlToBase64(base64),
        encoding: 'base64',

        success() {
          resolve(filePath)
        },

        fail(err) {
          reject(err)
        }
      })

      return
    }

    // ======================
    // H5
    // ======================
    if (typeof window === 'object') {

      const arr = base64.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]

      const bstr = atob(arr[1])
      let n = bstr.length

      const u8arr = new Uint8Array(n)

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }

      const blob = new Blob([u8arr], { type: mime })

      const url = URL.createObjectURL(blob)

      resolve(url)

      return
    }

    // ======================
    // APP
    // ======================
    if (typeof plus === 'object') {

      const bitmap = new plus.nativeObj.Bitmap(fileName)

      const filePath = '_doc/' + fileName

      bitmap.loadBase64Data(base64, function () {

        bitmap.save(filePath, {}, function () {

          bitmap.clear()

          resolve(filePath)

        }, function (err) {

          bitmap.clear()

          reject(err)

        })

      }, reject)

      return
    }

    reject(new Error('not support'))
  })
}