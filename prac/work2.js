var cars = ["BMW", "Volvo", "K", "Sonata"];
var text = null;
for(var i = 0;i < cars.length;i++){
  if(cars[i] == "BMW"){
    text = i + " find it!";
  }
}

console.log(text);