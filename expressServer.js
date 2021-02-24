const express = require('express')
const mysql = require('mysql');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

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

app.post('/userData', function(req, res){
  console.log("사용자의 요청이 전송되었습니다. 들어온 데이터는 " + req.body.userData1 + " " + req.body.userData2);
  connection.query('SELECT * FROM user', function(err, results, fields) {
    res.send(results);
  })
});

app.get('/designTest', function(req, res) {
  res.render("designSample");
})

app.get('/signUp', function(req, res) {
  res.render("signUp");
})
 
app.get('/user', function(req, res) {
  connection.query('SELECT * FROM fintech.user', function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
})

app.listen(3000);