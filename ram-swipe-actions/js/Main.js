// Generated by CoffeeScript 1.7.1
var count, files;

files = ['css/style.css', 'js/Ram.js', 'js/App.js', 'js/Data.DropBox.js', 'js/Item.js', 'js/ItemList.js', 'js/Utils.js', 'js/FuncUtils.js', 'js/Import.js'];

count = 0;

window.onload = function() {
  return Ram.CacheUtils.loadFiles(files, function(updated) {
    console.log('Ram.CacheUtils.loadFiles areFilesUpdated?', updated, count++);
    if (updated) {
      document.location.reload();
    }
    React.initializeTouchEvents(true);
    return React.renderComponent(Ram.App(), document.getElementById('appContainer'));
  });
};