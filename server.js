const express = require('express');
const mongoose = require('mongoose');
const graphqlHttp = require('express-graphql');
const bodyParser = require('body-parser');
const graphqlSchema = require('./schema');
const graphqlResolver = require('./resolvers');
const cors = require('cors');

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

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(
  '/graphql',
  cors(),
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || 'An error occurred.';
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    }
  })
);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});


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