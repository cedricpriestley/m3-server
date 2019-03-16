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
    similarArtists: SimilarArtists
    url: String
    tags: LastFMTags
    biography: Biography
  }

  type SimilarArtists {
    similarArtists: [SimilarArtist]
  }

  type Biography {
    summaryHTML: String
  }

  type LastFMTags {
    tags: [LastFMTag]
  }

  type LastFMTag {
    name: String
    url: String
  }

  type SimilarArtist {
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
    tags: Tags
    aliases: [Alias]
    area: ArtistArea
    beginArea: ArtistArea
    endArea: ArtistArea
    slug: String!
    relationships: AllRelationships
    lastUpdated: String!
    lastFM: LastFM
  }

  type AllRelationships {
    artists: Relationships
    areas: Relationships
    events: Relationships
    instruments: Relationships
    labels: Relationships
    places: Relationships
    recordings: Relationships
    releases: Relationships
    releaseGroups: Relationships
    series: Relationships
    works: Relationships
    urls: Relationships
  }

  type Relationships {
    nodes: [Relationship]
  }

  type Relationship {
    type: String
    targetType: String
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
    title: String
    resource: String
  }

  type ArtistArea {
    mbid: String
    name: String
    sortName: String
    disambiguation: String
    partOfArea: PartOfArea
  }

  type PartOfArea {
    areas: PartOfAreaAreas
    placeholder: PlaceholderNodes
  }

  type PlaceholderNodes{
    nodes: [String]
  }

  type PartOfAreaAreas {
    nodes: [PartOfAreaAreasNodes]
  }

  type PartOfAreaAreasNodes {
    target: Target
  }

  type Target {
    mbid: String
    name: String
    partOfArea: PartOfArea
  }

  type Rating {
    voteCount: Int
    value: Float
  }

  type Tags {
    tags: [Tag]
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

  type ArtistImage {
    url: String
    size: String
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

  input LifeSpanInput {
    begin: String
    end: String
    ended: Boolean
  }

  input AreaInput {
    id: String!
    name: String!
    disambiguation: String
    type: String!
    typeId: String!
    sortName: String!
    aliases: [String!]
    lifeSpan: LifeSpanInput
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
  }

  type Mutation {
    createArea(area: AreaInput!): Area
    updateArea(area: AreaInput!): Area
    deleteArea(id: Int!): Boolean
    saveArtist(data: String): Artist
  }
  `);