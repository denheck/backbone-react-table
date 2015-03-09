var PageableCollectionController = require('./pageable.js')
var CollectionController = require('./collection.js');

function Factory(collection) {
    if (collection.hasOwnProperty('state')) {
        return new PageableCollectionController(collection);
    }

    return new CollectionController(collection);
}

module.exports = Factory;