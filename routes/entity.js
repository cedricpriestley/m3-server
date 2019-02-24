//const path = require('path');
const express = require('express');

const entityController = require('../controllers/entity');

const router = express.Router();

const app = express();

// /api/count => GET
router.get('/:type/count', entityController.getEntityCount);

// /api/reset/:id => GET
router.get('/:type/reset/:id', entityController.resetEntity);

// /api/:type => GET
router.get('/:type/import/:id', entityController.importEntity);

// /api/:type => GET
router.get('/:type/:id/', entityController.getEntity);

app.route('/api/artist/browse/:offset/:count').get((req, res) => {
  console.log('/api/artist/browse/:offset/:count');
  const offset = req.params['offset'];
  const count = req.params['count'];

  browseArtists(offset, count, (documents) => {
    if (documents && documents.length >= 0) {
      res.send(documents);
    }
  });
});

app.route('/api/artist/search/:term/:offset/:count').get((req, res) => {
  const term = req.params['term'];
  const offset = req.params['offset'];
  const count = req.params['count'];
  console.log('/api/artist/search/:term/:offset/:count', term, offset, count);
  searchArtist(term, offset, count, (documents) => {
    res.send(documents);
  });
});

module.exports = router;