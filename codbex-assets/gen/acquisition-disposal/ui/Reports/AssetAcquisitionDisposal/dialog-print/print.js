const viewData = {
    id: 'codbex-assets-Reports-AssetAcquisitionDisposal-print',
    label: 'Print',
    link: '/services/web/codbex-assets/gen/acquisition-disposal/ui/Reports/AssetAcquisitionDisposal/dialog-print/index.html',
    perspective: 'Reports',
    view: 'AssetAcquisitionDisposal',
    type: 'page',
    order: 10
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}