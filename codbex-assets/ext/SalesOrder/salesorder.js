const viewData = {
    id: 'assets-sales-order',
    label: 'Generate Sales Order',
    link: '/services/web/codbex-orders/gen/codbex-orders/ui/SalesOrder/index.html',
    perspective: 'Disposal',
    view: 'Disposal',
    type: 'entity',
    order: 20
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}