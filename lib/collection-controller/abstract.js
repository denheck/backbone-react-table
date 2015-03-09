var Backbone = require('backbone');

var AbstractCollectionController = function (collection) {
    this.collection = collection;
};

AbstractCollectionController.prototype.getFirstShown = function () {
    var currentPage = this.getCurrentPage();
    var pageSize = this.pageSize;

    return this.collection.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
};

AbstractCollectionController.prototype.getLastShown = function () {
    var currentPage = this.getCurrentPage();
    var pageSize = this.pageSize;

    return currentPage * pageSize;
};

// Backbones helper method for correctly setting up the prototype chain for "subclasses"
AbstractCollectionController.extend = Backbone.Model.extend;

module.exports = AbstractCollectionController;