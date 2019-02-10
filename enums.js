const Enum = require('enum');

let Gender = new Enum({
  'Male': 'Male',
  'Female': 'Female',
  'Other': 'Other',
  'Not applicable': 'Not applicable'
});

let ArtistType = new Enum({
  'Person': 'Person',
  'Group': 'Group',
  'Other': 'Other',
  'Character': 'Character',
  'Orchestra': 'Orchestra',
  'Choir': 'Choir',
});

exports.Gender = Gender;
exports.ArtistType = ArtistType;