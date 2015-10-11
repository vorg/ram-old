Ram = Ram || {}

Ram.Config = {}
Ram.Config.LOCAL_UPDATE_TIMEOUT = 1000 #miliseconds
Ram.Config.DB_NAME = 'ram'
Ram.Config.REMOTE_SERVER = 'http://localhost:5984'
Ram.Config.REMOTE_DB = Ram.Config.REMOTE_SERVER + '/' + Ram.Config.DB_NAME
Ram.Config.ACTION_THRESHOLD = 0.4;
Ram.Config.SUB_ACTION_THRESHOLD = 0.6;
