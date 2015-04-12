// needed for access to React.addons
var React = require('react/addons')

var BackboneReactComponent = require('backbone-react-component');
// TODO: can probably get rid of this paginator and move to peerDependency
var BackbonePaginator = require('backbone.paginator');
var _ = require('underscore');
var $ = require('jquery');
var CollectionControllerFactory = require('./collection-controller/factory.js');

var Table = React.createClass({
    displayName: "Table",
    mixins: [BackboneReactComponent],
    componentWillMount: function () {
        this.collectionController = CollectionControllerFactory(this.getCollection());
    },
    /**
     * pass collectionController to all children
     */
    renderChildren: function () {
        var collectionController = this.collectionController;

        return React.Children.map(this.props.children, function (child) {
            return React.addons.cloneWithProps(child, {
                collectionController: collectionController
            });
        });
    },
    render: function () {
        return React.createElement("div", null, this.renderChildren());
    }
});

var TableBody = React.createClass({
    displayName: "TableBody",
    defaultRowRender: function (model, columns) {
        return (
            React.createElement(
                TableRow,
                {key: model.id, model: model, columns: columns}
            )
        );
    },
    render: function () {
        var collectionController = this.props.collectionController;
        var rowRender = this.props.rowRender;
        var columns = this.props.columns;

        var tableRows = collectionController.map(function (model) {
            if (rowRender) {
                return rowRender(model, columns, this.defaultRowRender);
            }

            return this.defaultRowRender(model, columns);
        }.bind(this));

        return React.createElement('tbody', null, tableRows);
    }
});

var TableElement = React.createClass({
    displayName: "TableElement",
    getColumns: function () {
        var columns = [];

        React.Children.forEach(this.props.children, function (child) {
            if (child.type === TableHead.type) {
                React.Children.forEach(child.props.children, function (grandchild) {
                    columns.push(grandchild.props);
                });
            }
        });

        return columns;
    },
    /**
     * pass collectionController and columns to all children
     */
    renderChildren: function () {
        var collectionController = this.props.collectionController;
        var columns = this.getColumns();

        return React.Children.map(this.props.children, function (child) {
            return React.addons.cloneWithProps(child, {
                collectionController: collectionController,
                columns: columns
            });
        });
    },
    render: function () {
        return (
            React.createElement(
                "table",
                {className: "table table-hover"},
                this.renderChildren()
            )
        );
    }
});

var TableHead = React.createClass({
    displayName: "TableHead",
    /**
     * pass collectionController to all children
     */
    renderChildren: function () {
        var collectionController = this.props.collectionController;

        return React.Children.map(this.props.children, function (child) {
            return React.addons.cloneWithProps(child, {
                collectionController: collectionController
            });
        });
    },
    render: function () {
        return (
            React.createElement(
                "thead",
                null,
                this.renderChildren()
            )
        );
    }
});

var TableHeader = React.createClass({
    displayName: "TableHeader",
    changeSort: function () {
        var collectionController = this.props.collectionController;

        if (this.props.sort !== true) {
            return;
        }

        collectionController.toggleSort(this.props.name);
    },
    render: function () {
        return React.createElement(
            "th",
            {onClick: this.changeSort},
            this.props.label
        );
    }
});

var TableRow = React.createClass({
    displayName: "TableRow",
    render: function () {
        var model = this.props.model;
        var className = this.props.className;
        var columns = this.props.columns;

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
    TableRow: TableRow,
    TablePageSize: TablePageSize,
    TableHeader: TableHeader,
    TableCount: TableCount,
    TablePaginator: TablePaginator,
    TableElement: TableElement,
    TableBody: TableBody,
    TableHead: TableHead
};
