const widgetsView = angular.module('widgets', ['ideUI', 'ideView']);

widgetsView.config(["messageHubProvider", function (messageHubProvider) {
    messageHubProvider.eventIdPrefix = 'codbex-assets';
}]);

widgetsView.controller('WidgetsViewController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, ViewParameters, messageHub) {

    $scope.generateWaste = function () {
        const params = ViewParameters.get();

        if (!params || !params.id) {
            console.error('Invalid or missing ViewParameters.');
            alert('Invalid or missing ViewParameters.');
            return;
        }

        const disposalUrl = "http://localhost:8080/services/ts/codbex-assets/gen/codbex-assets/api/Disposal/DisposalService.ts/";
        const assetUrl = "http://localhost:8080/services/ts/codbex-assets/gen/codbex-assets/api/Asset/AssetService.ts/";
        const wasteUrl = "http://localhost:8080/services/ts/codbex-inventory/gen/codbex-inventory/api/Waste/WasteService.ts/";

        $http.get(disposalUrl + params.id)
            .then(function (response) {
                if (!response.data || !response.data.Asset)
                    throw new Error('Invalid disposal response: Missing asset information.');

                // console.log('Disposal Response:', JSON.stringify(response.data));

                return $http.get(assetUrl + response.data.Asset); // Getting the Asset info
            })
            .then(function (response2) { // Should be the Asset
                if (!response2.data || !response2.data.Product)
                    throw new Error('Invalid asset response: Missing product information.');

                // console.log('Asset Response:', JSON.stringify(response2.data));

                const wasteData = {
                    Date: new Date().toISOString(),
                    Product: response2.data.Product || 0, // Handling case if Product is undefined
                    Store: response2.data.Store || 0, // same
                    WasteType: 4,
                    Quantity: 1
                };

                return $http.post(wasteUrl, wasteData);
            })
            .then(function () {
                messageHub.closeDialogWindow('assets-waste');
                // console.log("Success");
                messageHub.triggerEvent('entityUpdated');
                messageHub.showAlertSuccess(
                    "Successfully generated Waste",
                    "Waste has been generated!"
                );
            })
            .catch(function (error) {
                console.error('Error during waste generation:', error);
                if (error.data) alert('An error occurred: ' + (error.data.message || 'Unknown error.'));
                else alert('Failed to generate waste. Please try again later.');

            });
    };

    $scope.closeDialog = function () {
        messageHub.closeDialogWindow('assets-waste');
    };
}]);

