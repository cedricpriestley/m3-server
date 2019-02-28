//const path = require('path');
const express = require('express');

const entityController = require('../controllers/entity');

const router = express.Router();

const app = express();

router.get('/:type/count', entityController.getEntityCount);
router.get('/:type/reset/:id', entityController.resetEntity);
router.get('/:type/import/:id', entityController.importEntity);
router.get('/:type/:id/', entityController.getEntity);
router.get('/:type/browse/:offset/:count', entityController.browseEntities);

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