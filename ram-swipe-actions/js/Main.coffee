files = [
  'css/style.css' ,
  'js/Ram.js', 'js/App.js', 'js/Data.DropBox.js',
  'js/Item.js', 'js/ItemList.js',
  'js/Utils.js', 'js/FuncUtils.js', 'js/Import.js'
]

count = 0
window.onload = () ->
  Ram.CacheUtils.loadFiles(files, (updated) ->
    console.log('Ram.CacheUtils.loadFiles areFilesUpdated?', updated, count++)
    if updated then document.location.reload()
    React.initializeTouchEvents(true)
    React.renderComponent(Ram.App(), document.getElementById('appContainer'))
  )
