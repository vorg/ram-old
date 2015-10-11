console.log('Hello in App 4!');

var cssFiles = [ 'css/style.css' ];
var jsFiles = [ 'js/data.js', 'js/cashflow.js' ];

loadCSSFiles(cssFiles, function(isCSSUpdated) {
  console.log('isCSSUpdated', isCSSUpdated);
  loadJSFiles(jsFiles, function(isJSUpdated) {
    console.log('isJSUpdated', isJSUpdated);
    if (isCSSUpdated || isJSUpdated) {
      settingsCtrl.needsRefresh();
    }
  });
});
