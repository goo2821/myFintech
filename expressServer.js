const express = require('express')
const mysql = require('mysql');
const path = require('path');
const request = require('request');
const jwt = require('jsonwebtoken');
const moment = require('moment');
var auth = require('./lib/auth.js');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', __dirname + '/views');//디렉토리 설정
app.set('view engine', 'ejs');//뷰 엔진 ejs 설정

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'fintech'
});

connection.connect();

app.get('/', function (req, res) {
  res.send('Hello world')
})

app.get('/ejs', function (req, res) {
  res.render('ejsTest');
})

app.post('/userData', function (req, res) {
  console.log("사용자의 요청이 전송되었습니다. 들어온 데이터는 " + req.body.userData1 + " " + req.body.userData2);
  connection.query('SELECT * FROM user', function (err, results, fields) {
    res.send(results);
  })
});

app.get('/designTest', function (req, res) {
  res.render("designSample");
})

app.get('/signUp', function (req, res) {
  res.render("signUp");
})

app.get('/authResult', function (req, res) {
  var authCode = req.query.code;
  var option = {
    method: "POST",
    url: "https://testapi.openbanking.or.kr/oauth/2.0/token",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      code: authCode,
      client_id: "ce1a27ab-a181-4df6-afce-30cea1e1504b",
      client_secret: "224652e2-f41e-4dc8-8094-3f0e97cc4c96",
      redirect_uri: "http://localhost:3000/authResult",
      grant_type: "authorization_code"
    }
  }

  request(option, function (err, response, body) {
    if (err) {
      console.log(err);
      throw err;
    } else {
      var accessRequestResult = JSON.parse(body);
      res.render('resultChild', { data: accessRequestResult });
    }
  })
})

app.post('/signup', function (req, res) {
  var userName = req.body.userName;
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var userAccessToken = req.body.userAccessToken;
  var userRefreshToken = req.body.userRefreshToken;
  var userSeqNo = req.body.userSeqNo;

  console.log(userName + " " + userEmail + " " + userPassword + " " + userAccessToken + " " + userRefreshToken + " " + userSeqNo);

  var sql = "INSERT INTO fintech.user (name, email, password, accesstoken, refreshtoken, userseqno) VALUES (?, ?, ?, ?, ?, ?)";

  connection.query(sql, [userName, userEmail, userPassword, userAccessToken, userRefreshToken, userSeqNo], function (err, result) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      res.json(1);
    }
  })
})

app.get('/login', function (req, res) {
  res.render('login');
})

app.post('/login', function (req, res) {
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  console.log(userEmail, userPassword)
  var sql = "SELECT * FROM user WHERE email = ?";
  connection.query(sql, [userEmail], function (err, result) {
    if (err) {
      console.error(err);
      res.json(0);
      throw err;
    }
    else {
      console.log(result);
      if (result.length == 0) {
        res.json(3)
      }
      else {
        var dbPassword = result[0].password;
        if (dbPassword == userPassword) {
          var tokenKey = "f@i#n%tne#ckfhlafkd0102test!@#%"
          jwt.sign(
            {
              userId: result[0].id,
              userEmail: result[0].email
            },
            tokenKey,
            {
              expiresIn: '10d',
              issuer: 'fintech.admin',
              subject: 'user.login.info'
            },
            function (err, token) {
              console.log('로그인 성공', token)
              res.json(token)
            }
          )
        }
        else {
          res.json(2);
        }
      }
    }
  })
})

app.get('/authTest', auth, function(req, res){
  res.send("정상적으로 로그인 하셨다면 해당 화면이 보입니다.");
})

app.get('/main', function(req, res) {
  res.render('main');
})

app.post('/list', auth, function(req, res){
  var user = req.decoded;
  
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql, [user.userId], function(err, result){
    if(err) throw err;
    else {
      var dbUserData = result[0];
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/user/me",
        headers: {
          Authorization: "Bearer " + dbUserData.accesstoken,
        },
        qs: {
          user_seq_no: dbUserData.userseqno,
        }
      }
    
      request(option, function (err, response, body) {
        if (err) {
          console.log(err);
          throw err;
        } else {
          var result = JSON.parse(body);
          res.json(result);
        }
      })
    }
  })
})

app.get('/balance', function(req, res) {
  res.render('balance');
})

app.post('/balance', auth, function(req, res) {
  var user = req.decoded;
  
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql, [user.userId], function(err, result){
    if(err) throw err;
    else {
      var dbUserData = result[0];
      var finusernum = req.body.fin_use_num;
      var countnum = Math.floor(Math.random() * 1000000000) + 1;
      var transId = "M202111575U" + countnum;
      var transdtime = moment(new Date()).format('YYYYMMDDhhmmss');

      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num",
        headers: {
          Authorization: "Bearer " + dbUserData.accesstoken,
        },
        qs: {
          bank_tran_id: transId,
          fintech_use_num: finusernum,
          tran_dtime: transdtime,
        }
      }
      request(option, function (err, response, body) {
        if (err) {
          console.log(err);
          throw err;
        } else {
          var result = JSON.parse(body);
          res.json(result);
        }
      })
    }
  })
})

app.post('/transactionList', auth, function(req, res){
  var user = req.decoded;
  var finusernum = req.body.fin_use_num;
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "M202111575U" + countnum;
  var transdtime = moment(new Date()).format('YYYYMMDDhhmmss');
  console.log(transdtime);
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql,[user.userId], function(err, result){
      if(err) throw err;
      else {
          var dbUserData = result[0];
          console.log(dbUserData);
          var option = {
              method : "GET",
              url : "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
              headers : {
                  Authorization : "Bearer " + dbUserData.accesstoken
              },
              qs : {
                  bank_tran_id : transId,
                  fintech_use_num : finusernum,
                  inquiry_type : 'A',
                  inquiry_base : 'D',
                  from_date : '20190101',
                  to_date : '20190101',
                  sort_order : 'D',
                  tran_dtime : transdtime
              }
          }
          request(option, function(err, response, body){
              if(err){
                  console.error(err);
                  throw err;
              }
              else {
                  var transactionListResuult = JSON.parse(body);
                  res.json(transactionListResuult)
              }
          })        
      }
  })
})

app.get('/qrcode', function(req, res){
  res.render('qrcode');
})

app.get('/user', function (req, res) {
  connection.query('SELECT * FROM fintech.user', function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
})


app.listen(3000);