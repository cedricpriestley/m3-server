var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/m3', {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log(`We are connected to MongoDB!`);
});

var artistSchema = new mongoose.Schema({
  _id: {type: Number},
  name: String,
  gid: String
});

// NOTE: methods must be added to the schema before compiling it with mongoose.model()
artistSchema.methods.speak = function () {
  var greeting = this.name
    ? "Hi name is " + this.name
    : "I don't have a name";
  console.log(greeting);
}

var Artist = mongoose.model('artists', artistSchema);

var cedric = new Artist({ _id: 1, gid: "1", name: `John Smith` });
console.log(cedric.name); // 'cedric'

//var simone = new Artist({ _id: 3, gid: "3", name: `Simone Wilson` });
//cedric.save(function (err, simone) {
  //if (err) return console.error(err);
  //cedric.speak();
//});

Artist.find(function (err, artists) {
  if (err) return console.error(err);
  //console.log(artists);
})

//Artist.find({ name: /^ced/ }, callback);
Artist.find({ _id: 1 }, function (err, artists) {
  if (err) return console.error(err);
  console.log(artists);
}); 