const widgetsView = angular.module('widgets', ['ideUI', 'ideView']);

widgetsView.config(["messageHubProvider", function (messageHubProvider) {
    messageHubProvider.eventIdPrefix = 'codbex-assets';
}])

widgetsView.controller('WidgetsViewController', ['$scope', '$http', 'ViewParameters', "messageHub", function ($scope, $http, ViewParameters, messageHub) {
    $scope.generateSalesOrder = function () {
        const params = ViewParameters.get();

        const disposalUrl = "http://localhost:8080/services/ts/codbex-assets/gen/codbex-assets/api/Disposal/DisposalService.ts/";

        $http.get(disposalUrl + params.id)
            .then(function (response) {
                let saleValue = response?.data.SaleValue ? response.data.SaleValue : null;

                if (saleValue) {
                    console.log(saleValue);
                    // Create sales order here
                    // $http.post("here should be the salesorder url", {
                    //     ...response.data,
                    //     Batch: batch
                    // }).then(function (_) {
                    // });
                }
                else {
                    //! Throw an error here;
                }

                messageHub.closeDialogWindow('assets-sales-order');
                messageHub.triggerEvent('entityUpdated');
            });
    }
    $scope.closeDialog = function () {
        messageHub.closeDialogWindow('assets-sales-order');
    }
}]);

