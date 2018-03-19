var path = require('path')
var fs = require('fs')

var incID = new Date().getTime()
function getUniq () {
  return (incID += 5).toString(36).substring(4)
}

class ExpendedTankValues {
  constructor (options) {
    this.file = options.file
    this.jsonp = options.jsonp
    this.dist = options.dist
    this.to = options.to
    this.root = options.root
    this.assert = []

    if (!fs.existsSync(this.file)) {
      const msg = `The source JSON file ${this.file} is not found`
      this.file = null
      throw new Error(msg)
    }
  }

  apply (compiler) {
    compiler.plugin("emit", (compilation, callback) => {
      compilation.options.etv = this
      if (!this.dist) {
        this.dist = compilation.options.output.path
      }

      if (!this.file) {
        return callback()
      }

      this.assert = []

      this._readSource()
      .then(list => this._readDependFiles(list))
      .then(list => this._writeDependFiles(list))
      .then(asserts => {
        if (!asserts.length) return
        asserts.forEach(assert => this.assert.push(assert))
      })
      .then(() => this.WriteSourceJSONP())
      .then(() => callback())
      .catch(err => console.log('ERROR', err))
    })
  }

  _readDependFiles (list) {
    var data = []

    list.forEach(url => {
      data.push(new Promise((resolve) => {
        fs.readFile(path.resolve(this.SourceDirectory(), url), 'utf-8', (err, data) => {
          var json = {url: url}
          if (err) return resolve(json)

          try {
            json.file = JSON.parse(data)
          } catch (e) { }

          return resolve(json)
        })
      }))
    })

    return Promise.all(data)
  }

  _writeDependFiles (list) {
    let directory = this.OutputDirectory()
    var data = []

    function getFileByUrl (url) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url === url) {
          return list[i].file
        }
      }

      return null
    }

    for (var rating in this.json) {
      this.json[rating].forEach(line => {
        if (!/^https?:\/\//.test(line.url)) {
          if (line.rejected) return

          let file = getFileByUrl(line.url)
          if (!file) {
            line.rejected = 'incorrect JSON'
            return
          }

          line.id = getUniq()
          let outfile = path.parse(path.resolve(line.url)).base

          data.push(
            new Promise((resolve, reject) => {
              fs.writeFile(
                path.join(directory, `${outfile}.js`),
                this.WrapJSONP(JSON.stringify({id: line.id, file: file})),
                err => {
                  if (err) {
                    delete line.id
                    line.rejected = `IO Error, ${err}`
                    return reject(err)
                  } else {
                    delete line.url
                    return resolve(path.join('./etv', outfile + '.js'))
                  }
                })
            })
          )
        }
      })
    }

    return Promise.all(data)
  }

  _readSource () {
    var list = []
    this.json = null

    return new Promise((resolve, reject) => {
      fs.readFile(this.file, 'utf-8', (err, data) => {
        if (err) {
          return reject(`Cannot read file: ${this.file}`)
        }

        try {
          this.json = JSON.parse(data)
        } catch (e) {
          return reject(`File '${this.file}' is not a valid JSON format`)
        }

        for (var rating in this.json) {
          this.json[rating].forEach(line => {
            if (!/^https?:\/\//.test(line.url)) {
              let file = path.join(this.SourceDirectory(), line.url)
              if (fs.existsSync(file)) {
                list.push(line.url)
              } else {
                line.rejected = `incorrect local path`
              }
            }
          })
        }

        return resolve(list)
      })
    })
  }

  WriteSourceJSONP () {
    const code = this.WrapJSONP(JSON.stringify(this.json, null, 2))
    const directory = this.OutputDirectory()
    const file = 'source.js'

    return new Promise((resolve, reject) => {
      fs.writeFile(path.join(directory, file), code, err => {
        return err ? reject(err) : resolve()
      })
    })
  }

  OutputDirectory (file = '') {
    let directory = path.join(this.dist, this.to, 'etv', file)
    directory
      .split(path.sep)
      .reduce((currentPath, folder) => {
        currentPath += folder + path.sep
        if (!fs.existsSync(currentPath)) {
          fs.mkdirSync(currentPath)
        }

        return currentPath
      }, '')

    return directory
  }

  WrapJSONP (json) {
    return `${this.jsonp.callback}(${json});`
  }

  SourceDirectory (file = '') {
    return path.join(path.parse(this.file).dir, file)
  }

  ScriptElement (src, async = false) {
    return `<script type="text/javascript" ${async ? 'async' : ''} src="${src}"></script>`
  }

  get ScriptMain () {
    const file = path.join(this.root, this.to, 'etv/source.js')
    return this.file ? this.ScriptElement(file) : ''
  }

  get ScriptGroup () {
    let scripts = [this.ScriptMain]
    for (var i = 0; i < this.assert.length; i++) {
      scripts.push(
        this.ScriptElement(
          path.join(this.root, this.to, this.assert[i])
        )
      )
    }
    return scripts.join('')
  }
}

module.exports = ExpendedTankValues
