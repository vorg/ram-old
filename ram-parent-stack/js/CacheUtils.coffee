Ram = Ram || {}

Ram.CacheUtils = (() ->

  getUrl = (url, callback) ->
    r = new XMLHttpRequest()
    r.open('GET', url, true)
    r.withCredentials = true
    r.onreadystatechange = () ->
      if r.readyState == 4 #finished
        if callback
          if r.status == 200
            callback(r.responseText)
          else
            callback(null)
        return
      else
        return #still loading
    r.send('')

  getJson = (url, callback) ->
    getUrl(url, (response) ->
      if callback
        if response
          callback(JSON.parse(response));
        else
          callback({ error : 'Invalid or no response'});
    )

  appendScript = (src) ->
    script = document.createElement('script')
    script.type = "text/javascript"
    scriptNode = document.createTextNode(src)
    script.appendChild(scriptNode)
    document.head.appendChild(script)

  appendStyle = (css) ->
    style = document.createElement('style')
    style.type = "text/css"
    cssNode = document.createTextNode(css)
    style.appendChild(cssNode)
    document.head.appendChild(style)

  fileNameToLocalStorageName = (fileName) ->
    fileName.replace(/[^\w]/g, '_')

  notNull = (o) ->
    return o != null

  getFromLocalStorage = (fileStorageName) ->
    return window.localStorage[fileStorageName]

  getFiles = (files) ->
    filesToLoad = files.map((o) -> o)
    loadedFiles = []

    done = false
    doneCallback = null

    loadNext = () ->
      if filesToLoad.length == 0
        done = true
        if doneCallback
          doneCallback(loadedFiles)
        return
      file = filesToLoad.shift()
      getUrl(file + '?t=' + Math.random(), (data) ->
        loadedFiles.push(data)
        loadNext()
      )

    loadNext()

    return {
      then: (callback) ->
        if done && callback
          callback(loadedFiles)
        else
          doneCallback = callback
    }

  loadContentFiles = (files, fileAction, callback) ->
    console.log('loadContentFiles', files)
    cachedFilesNames = files.map(fileNameToLocalStorageName)
    cachedFiles = cachedFilesNames.map(getFromLocalStorage)
    cachedFiles.filter(notNull).forEach(fileAction);
    newFiles = 0
    getFiles(files).then (loadedFiles) ->
      cachedFilesNames.forEach (name, i) ->
        if loadedFiles[i] && loadedFiles[i] != window.localStorage[name]
          console.log('Updated', name)
          window.localStorage[name] = loadedFiles[i]
          newFiles++
      if callback then callback(newFiles > 0)

  loadJSFiles = (files, callback) ->
    loadContentFiles(files, appendScript, callback)

  loadCSSFiles = (files, callback) ->
    console.log('loadCSSFiles')
    loadContentFiles(files, appendStyle, callback)

  isCssFile = (fileName) ->
    fileName.match(/\.css$/)

  isJsFile = (fileName) ->
    fileName.match(/\.js$/)

  loadFiles = (files, callback) ->
    console.log('loadFiles')
    cssFiles = files.filter(isCssFile)
    jsFiles = files.filter(isJsFile)
    loadCSSFiles cssFiles, (isCssUpdated) ->
      console.log('Ram.CacheUtils.loadFiles css done')
      loadJSFiles jsFiles, (isJsUpdated) ->
        console.log('Ram.CacheUtils.loadFiles js done')
        callback(isCssUpdated || isJsUpdated) if callback

  return {
    loadFiles: loadFiles,
    getUrl: getUrl,
    getJson: getJson
  }
)()

