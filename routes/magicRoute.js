const router = require('express').Router()
     const controller = require('../controller/userMagicLink')

     router.post('/email',controller.login)

     module.exports = router