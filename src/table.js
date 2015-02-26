var React = require('react');
var BackboneReactComponent = require('backbone-react-component');
var _ = require('underscore');
var $ = require('jquery');

var Table = React.createClass({
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

        var tableRows = collection.map(function (model) {
            return (
                <TableRow key={model.id} model={model} columns={columns} />
            );
        });

        var headerRow = columns.map(function (column) {
            var renderColumn = column.render;

            if (_(renderColumn).isFunction()) {
                return renderColumn(column, null, true);
            }

            var key = column.name + '_header';
            return (<TableHeaderColumn key={key} column={column} collection={collection} />);
        });

        var currentPage = collection.state.currentPage;
        var startShown = collection.length > 0 ? (currentPage - 1) * collection.length + 1 : 0;
        var endShown = currentPage * collection.length;

        return (
            <div>
                <div>
                    <ShowCount collection={collection} />
                </div>
                <table className="table table-hover">
                    <thead>{headerRow}</thead>
                    <tbody>{tableRows}</tbody>
                </table>
                <div>
                    <TableCount start-shown={startShown}
                        end-shown={endShown}
                        total={collection.state.totalRecords} />
                    <Paginator collection={collection} />
                </div>
            </div>
        );
    }
});

var TableHeaderColumn = React.createClass({
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

        return (<th onClick={this.changeSort}>{label}</th>);
    }
});

var TableRow = React.createClass({
    mixins: [BackboneReactComponent],
    render: function () {
        var model = this.getModel();
        var columns = this.props.columns;

        var tableCells = columns.map(function (column) {
            var renderColumn = column.render;

            if (_(renderColumn).isFunction()) {
                return renderColumn(column, model, false);
            }

            var value = model.get(column.name);
            var key = column.name + "_" + model.id;

            return (
                <td key={key}>{value}</td>
            );
        });

        return (
            <tr>{tableCells}</tr>
        );
    }
});

var Paginator = React.createClass({
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
            <div class="btn-group" role="group">
                <button type="button"
                    className="btn btn-default"
                    onClick={this.previous}
                    disabled={previousDisabled}>
                    Previous Page
                </button>
                <button type="button"
                    className="btn btn-default"
                    onClick={this.next}
                    disabled={nextDisabled}>
                    Next Page
                </button>
            </div>
        );
    }
});

var TableCount = React.createClass({
    render: function () {
        var total = this.props.total;
        var startShown = this.props['start-shown'];
        var endShown = this.props['end-shown'];

        return (<div>Showing {startShown} to {endShown} of {total} entries</div>);
    }
});

var ShowCount = React.createClass({
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
            <select onChange={this.changePageSize} ref="page_size">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        );
    }
});


module.exports = Table;