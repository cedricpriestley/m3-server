const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mysql = require('mysql');

const url = 'mongodb://localhost:27017';
const dbName = 'MeanMetaMusic';
const mbzDbName = "ngsdb";

//importDatabase();

function importDatabase() {

    const sTablesList = 'alternative_medium,alternative_medium_track,alternative_release,alternative_release_type,alternative_track,annotation,application,area,area_alias,area_alias_type,area_annotation,area_attribute,area_attribute_type,area_attribute_type_allowed_value,area_gid_redirect,area_tag,area_tag_raw,area_type,art_type,artist,artist_alias,artist_alias_type,artist_annotation,artist_attribute,artist_attribute_type,artist_attribute_type_allowed_value,artist_credit,artist_credit_name,artist_gid_redirect,artist_ipi,artist_isni,artist_meta,artist_rating_raw,artist_tag,artist_tag_raw,artist_type,autoeditor_election,autoeditor_election_vote,cdtoc,cdtoc_raw,country_area,cover_art,cover_art_type,dbmirror_Pending,dbmirror_PendingData,deleted_entity,edit,edit_area,edit_artist,edit_data,edit_event,edit_instrument,edit_label,edit_note,edit_note_recipient,edit_place,edit_recording,edit_release,edit_release_group,edit_series,edit_url,edit_work,editor,editor_collection,editor_collection_area,editor_collection_artist,editor_collection_deleted_entity,editor_collection_event,editor_collection_instrument,editor_collection_label,editor_collection_place,editor_collection_recording,editor_collection_release,editor_collection_release_group,editor_collection_series,editor_collection_type,editor_collection_work,editor_language,editor_oauth_token,editor_preference,editor_subscribe_artist,editor_subscribe_artist_deleted,editor_subscribe_collection,editor_subscribe_editor,editor_subscribe_label,editor_subscribe_label_deleted,editor_subscribe_series,editor_subscribe_series_deleted,editor_watch_artist,editor_watch_preferences,editor_watch_release_group_type,editor_watch_release_status,event,event_alias,event_alias_type,event_annotation,event_attribute,event_attribute_type,event_attribute_type_allowed_value,event_gid_redirect,event_meta,event_rating_raw,event_tag,event_tag_raw,event_type,gender,image_type,instrument,instrument_alias,instrument_alias_type,instrument_annotation,instrument_attribute,instrument_attribute_type,instrument_attribute_type_allowed_value,instrument_gid_redirect,instrument_tag,instrument_tag_raw,instrument_type,iso_3166_1,iso_3166_2,iso_3166_3,isrc,iswc,kv,l_area_area,l_area_artist,l_area_event,l_area_instrument,l_area_label,l_area_place,l_area_recording,l_area_release,l_area_release_group,l_area_series,l_area_url,l_area_work,l_artist_artist,l_artist_event,l_artist_instrument,l_artist_label,l_artist_place,l_artist_recording,l_artist_release,l_artist_release_group,l_artist_series,l_artist_url,l_artist_work,l_event_event,l_event_instrument,l_event_label,l_event_place,l_event_recording,l_event_release,l_event_release_group,l_event_series,l_event_url,l_event_work,l_instrument_instrument,l_instrument_label,l_instrument_place,l_instrument_recording,l_instrument_release,l_instrument_release_group,l_instrument_series,l_instrument_url,l_instrument_work,l_label_label,l_label_place,l_label_recording,l_label_release,l_label_release_group,l_label_series,l_label_url,l_label_work,l_place_place,l_place_recording,l_place_release,l_place_release_group,l_place_series,l_place_url,l_place_work,l_recording_recording,l_recording_release,l_recording_release_group,l_recording_series,l_recording_url,l_recording_work,l_release_group_release_group,l_release_group_series,l_release_group_url,l_release_group_work,l_release_release,l_release_release_group,l_release_series,l_release_url,l_release_work,l_series_series,l_series_url,l_series_work,l_url_url,l_url_work,l_work_work,label,label_alias,label_alias_type,label_annotation,label_attribute,label_attribute_type,label_attribute_type_allowed_value,label_gid_redirect,label_ipi,label_isni,label_meta,label_rating_raw,label_tag,label_tag_raw,label_type,language,link,link_attribute,link_attribute_credit,link_attribute_text_value,link_attribute_type,link_creditable_attribute_type,link_text_attribute_type,link_type,link_type_attribute_type,log_statistic,medium,medium_attribute,medium_attribute_type,medium_attribute_type_allowed_format,medium_attribute_type_allowed_value,medium_attribute_type_allowed_value_allowed_format,medium_cdtoc,medium_format,medium_index,old_editor_name,orderable_link_type,place,place_alias,place_alias_type,place_annotation,place_attribute,place_attribute_type,place_attribute_type_allowed_value,place_gid_redirect,place_tag,place_tag_raw,place_type,recording,recording_alias,recording_alias_type,recording_annotation,recording_attribute,recording_attribute_type,recording_attribute_type_allowed_value,recording_gid_redirect,recording_meta,recording_rating_raw,recording_tag,recording_tag_raw,release,release_alias,release_alias_type,release_annotation,release_attribute,release_attribute_type,release_attribute_type_allowed_value,release_country,release_coverart,release_gid_redirect,release_group,release_group_alias,release_group_alias_type,release_group_annotation,release_group_attribute,release_group_attribute_type,release_group_attribute_type_allowed_value,release_group_cover_art,release_group_gid_redirect,release_group_meta,release_group_primary_type,release_group_rating_raw,release_group_secondary_type,release_group_secondary_type_join,release_group_tag,release_group_tag_raw,release_label,release_meta,release_packaging,release_raw,release_status,release_tag,release_tag_raw,release_unknown_country,replication_control,script,series,series_alias,series_alias_type,series_annotation,series_attribute,series_attribute_type,series_attribute_type_allowed_value,series_gid_redirect,series_ordering_type,series_tag,series_tag_raw,series_type,statistic,statistic_event,tag,tag_relation,track,track_gid_redirect,track_raw,url,url_gid_redirect,vote,work,work_alias,work_alias_type,work_annotation,work_attribute,work_attribute_type,work_attribute_type_allowed_value,work_gid_redirect,work_language,work_meta,work_rating_raw,work_tag,work_tag_raw,work_type';
    const tablesList = sTablesList.split(',');

    const tablesList1 = tablesList.slice(0, 100);
    const tablesList2 = tablesList.slice(100, 200);
    const tablesList3 = tablesList.slice(200, 300);
    const tablesList4 = tablesList.slice(300, 400);
    //const tablesList1 = 'alternative_medium, alternative_medium_track'.split(',');

    ['area'].forEach(function (tableName) {
        processTable(tableName, function (insertDocs, updateDocs) {
            insertDocuments(dbName, tableName, insertDocs, function () {
            });
            updateDocuments(dbName, tableName, updateDocs, function () {
            });
        });
    });
}

function buildTablesList(callback) {
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: mbzDbName
    });

    var tableNames = [];

    connection.connect();

    var query = connection.query('SHOW TABLES', function (err, results, fields) {
        assert.equal(null, err);
        results.forEach(function (row, index) {
            tableNames.push(row.Tables_in_musicbrainz);
            if (results.length - 1 == index) {
                callback(tableNames);
                connection.end();
            }
        });
    });
}

function processTable(tableName, callback) {
    var insertDocs = [];
    var updateDocs = [];

    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: mbzDbName
    });
    connection.connect();
    sql = `SELECT * FROM ${mbzDbName}.${tableName} LIMIT 0,3`;
    //console.log(sql);
    var query = connection.query(sql, function (err, results, fields) {
        assert.equal(null, err);

        results.forEach(function (row, index) {
            processRow(row, tableName, function (action, document) {
                if (action == 'insert') {
                    insertDocs.push(document);
                }
                if (action == 'update') {

                    updateDocs.push(document);
                }
                if ((results.length - 1) == index) {
                    callback(insertDocs, updateDocs);
                }
            });
        });
    });
    connection.end();
};

function getColumns(obj) {
    var result = "";
    var columns = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            columns.push(key);
        }
    }

    return columns;
}

function processRow(row, tableName, callback) {
    //console.log(`Processing row ${row.id} for table ${tableName}`);

    var columns = Object.keys(row);
    var idColumn = '';
    var idValue = '';

    if (columns.includes('id')) {
        idColumn = 'id';
        idValue = row.id;
    } else if (columns.includes('gid')) {
        idColumn = 'gid';
        idValue = row.gid;
    } else if (columns.includes('name')) {
        idColumn = 'name';
        idValue = row.name;
    } else if (columns.includes('code')) {
        idColumn = 'code';
        idValue = row.code;
    } else if (columns.includes('mime_type')) {
        idColumn = 'mime_type';
        idValue = row.mime_type;
    } else if (columns.includes('link_type') && columns.includes('attribute_type')) {
        idColumn = 'link_type_link_attribute';
        idValue = `${row.link_type}-${row.attribute_type}`;
    } else if (columns.includes('link_type')) {
        idColumn = 'link_type';
        idValue = row.link_type;
    } else if (columns.includes('attribute_type')) {
        idColumn = 'attribute_type';
        idValue = row.attribute_type;
    } else {
        console.log(`missing id field in ${tableName}`);
        callback("", null);
        return;
    }

    findDocument(tableName, idValue, function (found) {
        var columns = Object.keys(row);
        var document = {};
        var idColumn = '';
        var idValue = '';

        if (columns.includes('id')) {
            idColumn = 'id';
            idValue = row.id;
        } else if (columns.includes('gid')) {
            idColumn = 'gid';
            idValue = row.gid;
        } else if (columns.includes('name')) {
            idColumn = 'name';
            idValue = row.name;
        } else if (columns.includes('code')) {
            idColumn = 'code';
            idValue = row.code;
        } else if (columns.includes('mime_type')) {
            idColumn = 'mime_type';
            idValue = row.mime_type;
        } else if (columns.includes('link_type') && columns.includes('attribute_type')) {
            idColumn = 'link_type_link_attribute';
            idValue = `${row.link_type}-${row.attribute_type}`;
        } else if (columns.includes('link_type')) {
            idColumn = 'link_type';
            idValue = row.link_type;
        } else if (columns.includes('attribute_type')) {
            idColumn = 'attribute_type';
            idValue = row.attribute_type;
        }

        if (!found) {
            document['_id'] = idValue;
            //columnsAry = columnsAry.filter(function (e) { return e !== idColumn })
        }

        columns.forEach(function (columnName) {
            columnValue = eval("row." + columnName);
            document[columnName] = columnValue;
        });

        if (found) {
            callback("update",
                [{ _id: idValue },
                {
                    $set: document
                }]);
        } else {
            //document = { _id: row.id, name: row.name, gid: row.gid };
            callback("insert", document);
        }
    });
};

function findDocument(tableName, id, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);

        db = client.db(dbName);
        collection = db.collection(tableName);
        collection.find({ '_id': id }).toArray(function (err, doc) {
            assert.equal(err, null);
            if (doc.length > 0) {
                callback(true);
            } else {
                callback(false);
            }
        });
        client.close();
    });
}

function insertDocuments(dbName, collectionName, documents, callback) {
    if (documents.length == 0) return;

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);

        db = client.db(dbName);
        collection = db.collection(collectionName);
        collection.insertMany(
            documents
            , function (err, result) {
                //console.log(`Inserted ${documents.length} documents into the collection`);
                callback(result);
            });
        client.close();
    });
}

function updateDocuments(dbName, collectionName, documents, callback) {
    if (documents.length == 0) return;

    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        documents.forEach(function (document) {
            collection.updateOne(
                document[0], document[1]
                , function (err, result) {
                    //console.log(`Updated ${documents.length} documents in the collection`);
                    callback(result);
                });
        });
        client.close();
    });
}