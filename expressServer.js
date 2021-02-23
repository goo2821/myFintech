const express = require('express')
const mysql = require('mysql');
const app = express()

app.set('views', __dirname + '/views');//디렉토리 설정
app.set('view engine', 'ejs');//뷰 엔진 ejs 설정

var connection = mysql.createConnection ({
  host : 'localhost',
  user : 'root',
  password : '1234',
  database : 'fintech'
});

connection.connect();

app.get('/', function (req, res) {
  res.send('Hello world')
})

app.get('/ejs', function(req, res){
  res.render('ejsTest');
})
 
app.get('/user', function(req, res) {
  connection.query('SELECT * FROM fintech.user', function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
})

app.listen(3000);