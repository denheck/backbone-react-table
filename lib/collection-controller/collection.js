var AbstractCollectionController = require('./abstract.js');

/*
 * Interface:
 * setPageSize
 * map
 * toggleSort
 * getPreviousPage
 * getNextPage
 * hasPreviousPage
 * hasNextPage
 * getTotalRecords
 * getFirstShown
 * getLastShown
 */

var CollectionController = AbstractCollectionController.extend({
    pageSize: 10,
    page: 1,
    sortState: 1,

    setPageSize: function (pageSize) {
        this.pageSize = pageSize;
    },

    map: function (mapFunction) {
        var start = (this.page - 1) * this.pageSize;
        var end = this.page * this.pageSize;
        return this.collection.slice(start, end).map(mapFunction);
    },

    toggleSort: function (name) {
        this.sortState *= -1;
        this.collection.comparator = function(a, b) {
            var a = a.get(name),
                b = b.get(name);

            if (a == b) return 0;

            if (this.sortState == 1) {
                return a > b ? 1 : -1;
            } else {
                return a < b ? 1 : -1;
            }
        };

        this.collection.sort();
    },

    hasPreviousPage: function () {
        return this.page > 1;
    },

    getPreviousPage: function () {
        if (this.hasPreviousPage()) {
            this.page--;
            // have to trigger change event so view re-renders
            this.collection.trigger('change');
        }
    },

    hasNextPage: function () {
        return (this.page * this.pageSize) < this.collection.length;
    },

    getNextPage: function () {
        if (this.hasNextPage()) {
            this.page++;
            // have to trigger change event so view re-renders
            this.collection.trigger('change');
        }
    },

    getCurrentPage: function () {
        return this.page;
    },

    getTotalRecords: function () {
        return this.collection.length;
    }
});

module.exports = CollectionController;