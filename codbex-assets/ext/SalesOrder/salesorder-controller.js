const widgetsView = angular.module('widgets', ['ideUI', 'ideView']);

widgetsView.config(["messageHubProvider", function (messageHubProvider) {
    messageHubProvider.eventIdPrefix = 'codbex-assets';
}]);

widgetsView.controller('WidgetsViewController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, ViewParameters, messageHub) {

    $scope.generateSalesOrder = function () {
        const params = ViewParameters.get();

        if (!params || !params.id) {
            console.error('Invalid or missing ViewParameters.');
            alert('Invalid or missing ViewParameters.');
            return;
        }

        const disposalUrl = "http://localhost:8080/services/ts/codbex-assets/gen/codbex-assets/api/Disposal/DisposalService.ts/";
        const assetUrl = "http://localhost:8080/services/ts/codbex-assets/gen/codbex-assets/api/Asset/AssetService.ts/";
        // change const salesOrderUrl = "http://localhost:8080/services/ts/codbex-inventory/gen/codbex-inventory/api/sales-order/sales-orderService.ts/";

        $http.get(disposalUrl + params.id)
            .then(function (response) {
                if (!response.data || !response.data.Asset)
                    throw new Error('Invalid disposal response: Missing asset information.');

                return $http.get(assetUrl + response.data.Asset); // Getting the Asset info
            })
            .then(function (response2) {
                if (!response2.data)
                    throw new Error('Invalid asset response: Missing product information.');

                const salesOrderData = {
                    Date: new Date().toISOString(),
                    Store: response2.data.Store || 0, // Handling undefined case
                    Due: Dropdown,
                    Customer: Dropdown,
                    Currency: Dropdown,
                    SentMethod: Dropdown,
                    SalesOrderStatus: New,
                    Operator: Dropdown,
                    Store: From Asset
                };

                return $http.post(salesOrderUrl, salesOrderData);
            })
            .then(function () {
                messageHub.closeDialogWindow('assets-sales-order');
                messageHub.triggerEvent('entityUpdated');
                messageHub.showAlertSuccess(
                    "Successfully generated Sales Order",
                    "Sales Order has been generated!"
                );
            })
            .catch(function (error) {
                console.error('Error during Sales Order generation:', error);
                if (error.data) alert('An error occurred: ' + (error.data.message || 'Unknown error.'));
                else alert('Failed to generate Sales Order. Please try again later.');
            });
    };

    $scope.closeDialog = function () {
        messageHub.closeDialogWindow('assets-sales-order');
    };
}]);

