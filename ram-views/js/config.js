console.log('document.location.host', document.location.host);
module.exports = {
  remoteDb: 'http://' + document.location.host + ':5984/ram_storage_vorg'
}