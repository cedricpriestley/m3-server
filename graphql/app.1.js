const express = require('express');
const mongoose = require('mongoose');
const graphqlHttp = require('express-graphql')
const graphqlSchema = require('./schema');
const graphqlResolver = require('./resolvers');

const app = express();

app.use('/', (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(
  '/graphql'
  , graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver
  })
);

mongoose
  .connect(
    'mongodb://localhost:27017/mbz',
    { useNewUrlParser: true }
  )
  .then(result => {
    app.listen(8000, () => {
      console.log('Server started!');
    });
  })
  .catch(err => {
    console.log(err);
  });