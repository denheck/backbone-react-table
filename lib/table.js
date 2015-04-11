var React = require('react');
var BackboneReactComponent = require('backbone-react-component');
// TODO: can probably get rid of this paginator and move to peerDependency
var BackbonePaginator = require('backbone.paginator');
var _ = require('underscore');
var $ = require('jquery');
var CollectionControllerFactory = require('./collection-controller/factory.js');

function parseOptions(options) {
    options.columns = options.columns.map(function (column) {
        var defaults = {
            sort: false
        };

        if (_(column).isString()) {
            column = { name: column, label: column };
        } else if ($.isPlainObject(column)) {
            column = _(defaults).extend(column);
        }

        return column;
    });

    return options;
}

var Table = React.createClass({
    displayName: "Table",
    mixins: [BackboneReactComponent],
    componentWillMount: function () {
        this.collectionController = CollectionControllerFactory(this.getCollection());
    },
    render: function () {
        var collectionController = this.collectionController;
        var options = parseOptions(this.props.options) || {};

        var defaultRowRender = function (model) {
            return (
                React.createElement(TableRow, {key: model.id, model: model, columns: options.columns})
            );
        };

        var tableRowMap = function (model) {
            if (options.rows && _(options.rows.render).isFunction()) {
                return options.rows.render(model, options.columns, defaultRowRender);
            }

            return defaultRowRender(model);
        };

        var tableRows = collectionController.map(tableRowMap);

        var headerRow = options.columns.map(function (column) {
            var renderColumn = column.render;

            if (_(renderColumn).isFunction()) {
                return renderColumn(column, null, true);
            }

            var key = column.name + '_header';
            return React.createElement(TableHeader, {
                key: key,
                column: column,
                collectionController: collectionController
            });
        });

        return (
            React.createElement("div", null,
                React.createElement("div", null,
                    React.createElement(TablePageSize, {collectionController: this.collectionController})
                ),
                React.createElement("table", {className: "table table-hover"},
                    React.createElement("thead", null, headerRow),
                    React.createElement("tbody", null, tableRows)
                ),
                React.createElement("div", null,
                    React.createElement(TableCount, {collectionController: this.collectionController}),
                    React.createElement(TablePaginator, {collectionController: this.collectionController})
                )
            )
        );
    }
});


var TableHeader = React.createClass({
    displayName: "TableHeader",
    changeSort: function () {
        var column = this.props.column;
        var name = column.name;

        if (column.sort !== true) {
            return;
        }

        this.collectionController.toggleSort(name);
    },
    render: function () {
        this.collectionController = this.props.collectionController;
        var column = this.props.column;
        var label = column.label;

        return (React.createElement("th", {onClick: this.changeSort}, label));
    }
});

var TableRow = React.createClass({
    displayName: "TableRow",
    mixins: [BackboneReactComponent],
    render: function () {
        var model = this.getModel();
        var columns = this.props.columns;
        var className = this.props.className;

        var tableCells = columns.map(function (column) {
            var renderColumn = column.render;

            if (_(renderColumn).isFunction()) {
                return renderColumn(column, model, false);
            }

            var value = model.get(column.name);
            var key = column.name + "_" + model.id;

            return (
                React.createElement("td", {key: key}, value)
            );
        });

        return (
            React.createElement("tr", {className: className}, tableCells)
        );
    }
});

var TablePaginator = React.createClass({
    displayName: "TablePaginator",
    previous: function (event) {
        event.preventDefault();
        this.collectionController.getPreviousPage();
    },
    next: function (event) {
        event.preventDefault();
        this.collectionController.getNextPage();
    },
    render: function () {
        this.collectionController = this.props.collectionController;
        return (
            React.createElement("div", {class: "btn-group", role: "group"},
                React.createElement("button", {type: "button",
                    className: "btn btn-default",
                    onClick: this.previous,
                    disabled: !this.collectionController.hasPreviousPage()},
                    "Previous Page"
                ),
                React.createElement("button", {type: "button",
                    className: "btn btn-default",
                    onClick: this.next,
                    disabled: !this.collectionController.hasNextPage()},
                    "Next Page"
                )
            )
        );
    }
});

var TableCount = React.createClass({
    displayName: "TableCount",
    render: function () {
        this.collectionController = this.props.collectionController;
        var totalRecords = this.collectionController.getTotalRecords();
        var firstShown = this.collectionController.getFirstShown();
        var lastShown = this.collectionController.getLastShown();

        return React.createElement("div", null, "Showing ", firstShown, " to ", lastShown, " of ", totalRecords, " entries");
    }
});

var TablePageSize = React.createClass({
    displayName: "TablePageSize",
    componentWillMount: function () {
        this.collectionController = this.props.collectionController;
    },
    changePageSize: function () {
        var select = this.refs.page_size.getDOMNode();
        var pageSize = parseInt(select.options[select.selectedIndex].value);
        this.collectionController.setPageSize(pageSize);
    },
    render: function () {
        return (
            React.createElement("select", {onChange: this.changePageSize, ref: "page_size"},
                React.createElement("option", {value: "10"}, "10"),
                React.createElement("option", {value: "25"}, "25"),
                React.createElement("option", {value: "50"}, "50"),
                React.createElement("option", {value: "100"}, "100")
            )
        );
    }
});

module.exports = {
    Table: Table,
    TableRow: TableRow
};
