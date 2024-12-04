const viewData = {
    id: 'codbex-assets-Reports-ASSET_VALUATION_DEPRECIATION_REPORT-print',
    label: 'Print',
    link: '/services/web/codbex-assets/gen/valuation-deprecation/ui/Reports/ASSET_VALUATION_DEPRECIATION_REPORT/dialog-print/index.html',
    perspective: 'Reports',
    view: 'ASSET_VALUATION_DEPRECIATION_REPORT',
    type: 'page',
    order: 10
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}