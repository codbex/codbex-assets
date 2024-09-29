const widgetsView = angular.module('widgets', ['ideUI', 'ideView']);

widgetsView.config(["messageHubProvider", function (messageHubProvider) {
    messageHubProvider.eventIdPrefix = 'codbex-assets';
}])

widgetsView.controller('WidgetsViewController', ['$scope', '$http', 'ViewParameters', "messageHub", function ($scope, $http, ViewParameters, messageHub) {
    $scope.submitCopy = function (batch) {
        const params = ViewParameters.get();

        const productUrl = "http://localhost:8080/services/ts/codbex-/gen/codbex-assets/api/Products/ProductService.ts/";

        $http.get(productUrl + params.id)
            .then(function (response) {
                console.log(JSON.stringify(params.data));

                $http.post(productUrl, {
                    ...response.data,
                    Batch: batch
                }).then(function (_) {
                    messageHub.closeDialogWindow('product-assets');

                    messageHub.triggerEvent('entityUpdated');
                });
            });
    }
}]);

