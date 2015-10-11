console.log('Hello in Cashflow!');

function ajaxGet(url, callback) {
  var r = new XMLHttpRequest();
  r.open('GET', url, true);
  r.onreadystatechange = function () {
    if (r.readyState == 4) { //finished
      if (r.status == 200) callback(r.responseText);
      else callback(null);
      return;
    }
    else {
      return; //still loading
    }
  };
  r.send('');
}

var jsFiles = ['js/data.js', 'js/ui.js'];
var jsFilesToLoad = [].concat(jsFiles);

function loadNextJsFile() {
  if (jsFilesToLoad.length == 0) return;
  var file = jsFilesToLoad.shift();
  var fileStorageName = file.replace(/[^\w]/g, '_');
  console.log('Loading ', file);
  ajaxGet(file, function(js) {
    if (js) {
      console.log('loadedl', js.split('\n')[2])
      window.localStorage[fileStorageName] = js;
    }
    else {
      js = window.localStorage[fileStorageName];
    }

    eval(js);
    loadNextJsFile();
  });
}

loadNextJsFile();

var cssFiles = ['style/style.css'];
var cssFilesToLoad = [].concat(cssFiles);

function loadNextCSSFile() {
  if (cssFilesToLoad.length == 0) return;
  var file = cssFilesToLoad.shift();
  var fileStorageName = file.replace(/[^\w]/g, '_');
  console.log('Loading ', file);
  ajaxGet(file, function(css) {
    if (css) {
      window.localStorage[fileStorageName] = css;
    }
    else {
      css = window.localStorage[fileStorageName];
    }
    var style = document.createElement('style');
    style.type = "text/css";
    var cssNode = document.createTextNode(css);
    style.appendChild(cssNode);
    document.head.appendChild(style);
    loadNextCSSFile();
  });
}

loadNextCSSFile();





