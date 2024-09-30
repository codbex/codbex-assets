const widgetsView = angular.module('widgets', ['ideUI', 'ideView']);

widgetsView.config(["messageHubProvider", function (messageHubProvider) {
    messageHubProvider.eventIdPrefix = 'codbex-assets';
}])

widgetsView.controller('WidgetsViewController', ['$scope', '$http', 'ViewParameters', "messageHub", function ($scope, $http, ViewParameters, messageHub) {
    $scope.generateWaste = function () {
        const params = ViewParameters.get();

        const disposalUrl = "http://localhost:8080/services/ts/codbex-assets/gen/codbex-assets/api/Disposal/DisposalService.ts/";

        $http.get(disposalUrl + params.id)
            .then(function (response) {

                // $http.post(disposalUrl, {
                //  Should generate Waste with product from asset 

                console.log(JSON.stringify(response.data));

                //     ...response.data,
                //     Batch: batch
                // }).then(function (_) {
                messageHub.closeDialogWindow('assets-waste');
                messageHub.triggerEvent('entityUpdated');
                // });
            });
    }
}]);

