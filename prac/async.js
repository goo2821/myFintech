var fs = require('fs');
console.log('first func');

fs.readFile('./example/test.txt', 'utf8', function(err, result) {
  if(err){
    console.log(err);
    throw err;
  }else {
    console.log("읽어오는데 시간이 걸립니다");
    console.log(result);
  }
});

console.log('third func');