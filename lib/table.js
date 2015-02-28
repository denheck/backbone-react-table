var React = require('react');
var BackboneReactComponent = require('backbone-react-component');
var _ = require('underscore');
var $ = require('jquery');

var Table = React.createClass({displayName: "Table",
    mixins: [BackboneReactComponent],
    render: function () {
        var collection = this.getCollection();
        var options = this.props.options || {};

        var columns = options.columns.map(function (column) {
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

        var defaultRowRender = function (model) {
            return (
                React.createElement(TableRow, {key: model.id, model: model, columns: columns})
            );
        };

        var tableRowMap = function (model) {
            if (_(options.rows.render).isFunction()) {
                return options.rows.render(model, columns, defaultRowRender);
            }

            return defaultRowRender(model);
        };

        var tableRows = collection.map(tableRowMap);

        var headerRow = columns.map(function (column) {
            var renderColumn = column.render;

            if (_(renderColumn).isFunction()) {
                return renderColumn(column, null, true);
            }

            var key = column.name + '_header';
            return (React.createElement(TableHeaderColumn, {key: key, column: column, collection: collection}));
        });

        var currentPage = collection.state.currentPage;
        var startShown = collection.length > 0 ? (currentPage - 1) * collection.length + 1 : 0;
        var endShown = currentPage * collection.length;

        return (
            React.createElement("div", null, 
                React.createElement("div", null, 
                    React.createElement(ShowCount, {collection: collection})
                ), 
                React.createElement("table", {className: "table table-hover"}, 
                    React.createElement("thead", null, headerRow), 
                    React.createElement("tbody", null, tableRows)
                ), 
                React.createElement("div", null, 
                    React.createElement(TableCount, {"start-shown": startShown, 
                        "end-shown": endShown, 
                        total: collection.state.totalRecords}), 
                    React.createElement(Paginator, {collection: collection})
                )
            )
        );
    }
});

var TableHeaderColumn = React.createClass({displayName: "TableHeaderColumn",
    mixins: [BackboneReactComponent],
    sortState: null,
    changeSort: function () {
        var collection = this.getCollection();
        var column = this.props.column;
        var name = column.name;

        if (column.sort !== true) {
            return;
        }

        if (this.sortState === 1) {
            this.sortState = null;
            collection.setSorting(null);
        } else if (this.sortState === -1) {
            this.sortState = 1;
            collection.setSorting(name, this.sortState);
        } else {
            this.sortState = -1;
            collection.setSorting(name, this.sortState);
        }

        collection.getFirstPage();
    },
    render: function () {
        var column = this.props.column;
        var label = column.label;

        return (React.createElement("th", {onClick: this.changeSort}, label));
    }
});

var TableRow = React.createClass({displayName: "TableRow",
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

var Paginator = React.createClass({displayName: "Paginator",
    mixins: [BackboneReactComponent],
    previous: function (event) {
        event.preventDefault();
        this.getCollection().getPreviousPage();
    },
    next: function (event) {
        event.preventDefault();
        this.getCollection().getNextPage();
    },
    render: function () {
        var collection = this.getCollection();
        var previousDisabled = collection.state.currentPage <= collection.state.firstPage;
        var nextDisabled = collection.state.currentPage >= collection.state.totalPages;

        return (
            React.createElement("div", {class: "btn-group", role: "group"}, 
                React.createElement("button", {type: "button", 
                    className: "btn btn-default", 
                    onClick: this.previous, 
                    disabled: previousDisabled}, 
                    "Previous Page"
                ), 
                React.createElement("button", {type: "button", 
                    className: "btn btn-default", 
                    onClick: this.next, 
                    disabled: nextDisabled}, 
                    "Next Page"
                )
            )
        );
    }
});

var TableCount = React.createClass({displayName: "TableCount",
    render: function () {
        var total = this.props.total;
        var startShown = this.props['start-shown'];
        var endShown = this.props['end-shown'];

        return (React.createElement("div", null, "Showing ", startShown, " to ", endShown, " of ", total, " entries"));
    }
});

var ShowCount = React.createClass({displayName: "ShowCount",
    mixins: [BackboneReactComponent],
    componentWillMount: function () {
        var collection = this.getCollection();

        if (collection.state.pageSize != 10) {
            // page size is first option by default
            this.getCollection().setPageSize(10);
        }
    },
    changePageSize: function () {
        var select = this.refs.page_size.getDOMNode();
        var pageSize = parseInt(select.options[select.selectedIndex].value);
        this.getCollection().setPageSize(pageSize);
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