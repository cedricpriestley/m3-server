const {
  buildSchema
} = require('graphql');

module.exports = buildSchema(`
  type LifeSpan {
    begin: String
    end: String
    ended: Boolean
  }

  type LastFM {
    smallImage: String
    mediumImage: String
    largeImage: String
    extraLargeImage: String
    megaImage: String
    similarArtists: [LastFMSimilarArtist]
    url: String
    topTags: [LastFMTag]
    biography: Biography
  }

  type Biography {
    summaryHTML: String
  }

  type LastFMTag {
    name: String
    url: String
  }

  type LastFMSimilarArtist {
    mbid: String
    name: String!
    image: String
  }

  type Area {
    _id: ID!
    id: String!
    name: String!
    disambiguation: String
    type: String
    typeId: String!
    sortName: String!
    aliases: [String!]
    lifeSpan: LifeSpan
    slug: String!
    lastUpdated: String!
  }

  type Artist {
    _id: ID!
    mbid: String!
    name: String!
    sortName: String
    disambiguation: String
    country: String
    type: String
    typeID: String
    rating: Rating
    gender: String
    genderID: String
    lifeSpan: LifeSpan
    tags: [Tag]
    aliases: [Alias]
    area: NestedArea
    beginArea: NestedArea
    endArea: NestedArea
    slug: String!
    relationships: Relationships
    lastUpdated: String!
    lastFM: LastFM
  }

  type Relationships {
    artists: ArtistRelationships
  }

  type ArtistRelationships {
    teacher: Relationship
  }

  type Relationship {
    direction: String
    begin: String
    end: String
    ended: Boolean
    targetCredit: String
    sourceCredit: String
    target: RelationTarget
    attributes: [String]
  }

  type RelationTarget {
    mbid: String
    name: String
  }

  type NestedArea {
    mbid: String
    name: String
    sortName: String
    disambiguation: String
    area: NestedArea
  }

  type Rating {
    voteCount: Int
    value: Float
  }

  type Tag {
    name: String
    count: Int
  }

  type Alias {
    name: String
    type: String
  }

  type Label {
    _id: ID!
    id: String!
    name: String!
    disambiguation: String
    type: String
    country: String
  }

  type ReleaseGroup {
    _id: ID!
    id: String!
    title: String!
    releases: [Release]
    primary_type: String
  }

  type Release {
    _id: ID!
    id: String!
    title: String!
    coverart_url: String
    country: String
    disambiguation: String
    status: String
  }

  type Query {
    getAreas(limit: Int, offset: Int) : [Area]
    getArea(id: String!) : Area
    getArtist(mbid: String!) : Artist
    getLabels(limit: Int, offset: Int) : [Label]
    getLabel(id: String!) : Label
    getArtists(limit: Int, offset: Int) : [Artist]
    getReleases(limit: Int, offset: Int) : [Release]
    getReleaseGroups(limit: Int, offset: Int) : [ReleaseGroup]
    target: RelationTarget
  }

  type Mutation {
    saveArtist(data: String): Artist
  }
  `);