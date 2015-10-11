function getUrl(url, callback) {
  var r = new XMLHttpRequest();
  r.open('GET', url, true);
  r.withCredentials = true;
  r.onreadystatechange = function () {
    if (r.readyState == 4) { //finished
      if (callback) {
        if (r.status == 200) callback(r.responseText);
        else callback(null);
      }
      return;
    }
    else {
      return; //still loading
    }
  };
  r.send('');
}

function postToUrl(url, data, callback) {
  data = data || {};
  var r = new XMLHttpRequest();
  r.open('POST', url, true);
  r.setRequestHeader('Content-Type', 'application/json');
  r.withCredentials = true;
  r.onreadystatechange = function () {
    if (r.readyState == 4) { //finished
      if (callback) {
        if (r.status == 200) callback(JSON.parse(r.responseText));
        else callback(null);
      }
      return;
    }
    else {
      return; //still loading
    }
  };
  r.send(JSON.stringify(data));
}

function postDeleteToUrl(url, data, callback) {
  data = data || {};
  var r = new XMLHttpRequest();
  r.open('DELETE', url, true);
  r.setRequestHeader('Content-Type', 'application/json');
  r.withCredentials = true;
  r.onreadystatechange = function () {
    if (r.readyState == 4) { //finished
      if (callback) {
        if (r.status == 200) callback(JSON.parse(r.responseText));
        else callback(null);
      }
      return;
    }
    else {
      return; //still loading
    }
  };
  r.send(JSON.stringify(data));
}

function getJson(url, callback) {
  getUrl(url, function(response) {
    if (callback) {
      if (response) {
        callback(JSON.parse(response));
      }
      else {
        callback({ error : 'Invalid or no response'});
      }
    }
  })
}

function appendScript(src) {
  var script = document.createElement('script');
  script.type = "text/javascript";
  var scriptNode = document.createTextNode(src);
  script.appendChild(scriptNode);
  document.head.appendChild(script);
}

function appendStyle(css) {
  var style = document.createElement('style');
  style.type = "text/css";
  var cssNode = document.createTextNode(css);
  style.appendChild(cssNode);
  document.head.appendChild(style);
}

function fileNameToLocalStorageName(fileName) {
  return fileName.replace(/[^\w]/g, '_');
}

function notNull(o) {
  return o != null;
}

function getFromLocalStorage(fileStorageName) {
  return window.localStorage[fileStorageName];
}

function loadFiles(files) {
  var filesToLoad = files.map(function(o) { return o; })
  var loadedFiles = [];

  var done = false;
  var doneCallback = null;

  function loadNext() {
    if (filesToLoad.length == 0) {
      done = true;
      if (doneCallback) {
        doneCallback(loadedFiles);
      }
      return;
    }
    var file = filesToLoad.shift();
    getUrl(file + '?t=' + Math.random(), function(data) {
      loadedFiles.push(data);
      loadNext();
    });
  }

  loadNext();

  return {
    then: function(callback) {
      if (done && callback) {
        callback(loadedFiles);
      }
      else {
        doneCallback = callback;
      }
    }
  }
}

function loadContentFiles(files, fileAction, callback) {
  var cachedFilesNames = files.map(fileNameToLocalStorageName);
  var cachedFiles = cachedFilesNames.map(getFromLocalStorage);
  cachedFiles.filter(notNull).forEach(fileAction);
  var newFiles = 0;
  loadFiles(files).then(function(loadedFiles) {
    cachedFilesNames.forEach(function(name, i) {
      if (loadedFiles[i] && loadedFiles[i] != window.localStorage[name]) {
        window.localStorage[name] = loadedFiles[i];
        newFiles++;
      }
    })
    if (callback) callback(newFiles > 0)
  })
}

function loadJSFiles(files, callback) {
  loadContentFiles(jsFiles, appendScript, callback);
}

function loadCSSFiles(files, callback) {
  loadContentFiles(files, appendStyle, callback);
}
