const express = require('express');
const mongoose = require('mongoose');

const entityRoutes = require('./routes/entity');
//const errorController = require('./controllers/error');

const app = express();

app.use('/', (req, res, next) => {
  //res.setHeader('Last-Modified', (new Date()).toUTCString());
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/api', entityRoutes);
//app.disable('etag');
mongoose
  .connect(
    'mongodb://localhost:27017/mbz',
    { useNewUrlParser: true }
  )
  .then(result => {
    /*
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Max',
          email: 'max@test.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    */
    app.listen(8000, () => {
      console.log('Server started!');
    });
  })
  .catch(err => {
    console.log(err);
  });