if(process.env.NODE_ENV !== 'production'){
  require('dotenv').parse()
  var DATABASE_URL="mongodb://db:27017/biblioteca"
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

const indexRoute = require('./routes/index')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'plantilla/plantilla')
app.use(expressLayouts)
app.use(express.static('public'))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})

const db = mongoose.connection

db.on('error', error => console.error(error) );

db.once("open", () =>
  console.log("Base de datos: \x1b[32m%s\x1b[0m", "En linea")
);

app.use('/', indexRoute)

app.listen(process.env.PORT || 3000,  ()=>{
  console.log('\x1b[33m Express server puerto 3000...\x1b[43m\x1b[34m %s\x1b[0m', 'V ' + '1.0' +'\x1b[31m\x1b[46m Author: ' + 'JHC');
  
})
