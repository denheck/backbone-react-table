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

var PageableCollectionController = AbstractCollectionController.extend({
    pageSize: 10,
    page: 1,
    sortState: 1,

    setPageSize: function (pageSize) {
        this.pageSize = pageSize;
        this.collection.setPageSize(pageSize);
    },

    map: function (mapFunction) {
        return this.collection.map(mapFunction);
    },

    toggleSort: function (name) {
        this.sortState *= -1;
        this.collection.setSorting(name, this.sortState);
        this.collection.getFirstPage();
    },

    hasPreviousPage: function () {
        return this.collection.state.currentPage > this.collection.state.firstPage
    },

    getPreviousPage: function () {
        if (this.hasPreviousPage()) this.collection.getPreviousPage();
    },

    hasNextPage: function () {
        return this.collection.state.currentPage < this.collection.state.totalPages;
    },

    getNextPage: function () {
        if (this.hasNextPage()) this.collection.getNextPage();
    },

    getCurrentPage: function () {
        return this.collection.state.currentPage;
    },

    getTotalRecords: function () {
        return this.collection.state.totalRecords;
    }
});

module.exports = PageableCollectionController;