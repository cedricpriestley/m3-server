var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017', {  });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log(`We are connected to MongoDB!`);
});

db.name = "m3db";

var artistSchema = new mongoose.Schema({
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

var paul = new Artist({ _id: 2000000, gid: "1", name: `Cedric Priestley` });
console.log(paul.name); // 'paul'

var david = new Artist({ _id: 2000001, gid: "2", name: `Simone Wilson` });
david.save(function (err, david) {
  if (err) return console.error(err);
  david.speak();
});

Artist.find(function (err, artists) {
  if (err) return console.error(err);
  console.log(artists);
})

//Artist.find({ name: /^dav/ }, callback); 