const viewData = {
    id: 'codbex-assets-Reports-ASSET_MAINTENANCE_STATUS_REPORT-print',
    label: 'Print',
    link: '/services/web/codbex-assets/gen/maintenance/ui/Reports/ASSET_MAINTENANCE_STATUS_REPORT/dialog-print/index.html',
    perspective: 'Reports',
    view: 'ASSET_MAINTENANCE_STATUS_REPORT',
    type: 'page',
    order: 10
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}