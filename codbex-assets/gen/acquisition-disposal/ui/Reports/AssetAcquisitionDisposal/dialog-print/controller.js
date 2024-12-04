angular.module('page', ["ideUI", "ideView", "entityApi"])
    .config(["messageHubProvider", function (messageHubProvider) {
        messageHubProvider.eventIdPrefix = 'codbex-assets.Reports.AssetAcquisitionDisposal';
    }])
    .config(["entityApiProvider", function (entityApiProvider) {
        entityApiProvider.baseUrl = "/services/ts/codbex-assets/gen/acquisition-disposal/api/AssetAcquisitionDisposal/AssetAcquisitionDisposalService.ts";
    }])
    .controller('PageController', ['$scope', 'messageHub', 'entityApi', 'ViewParameters', function ($scope, messageHub, entityApi, ViewParameters) {

		let params = ViewParameters.get();
		if (Object.keys(params).length) {         
            const filterEntity = params.filterEntity ?? {};

			const filter = {
			};

            $scope.filter = filter;
		}

        $scope.loadPage = function (filter) {
            if (!filter && $scope.filter) {
                filter = $scope.filter;
            }
            let request;
            if (filter) {
                request = entityApi.search(filter);
            } else {
                request = entityApi.list();
            }
            request.then(function (response) {
                if (response.status != 200) {
                    messageHub.showAlertError("AssetAcquisitionDisposal", `Unable to list/filter AssetAcquisitionDisposal: '${response.message}'`);
                    return;
                }

                response.data.forEach(e => {
                    if (e['acquisitionDate']) {
                        e['acquisitionDate'] = new Date(e['acquisitionDate']);
                    }
                    if (e['disposalDate']) {
                        e['disposalDate'] = new Date(e['disposalDate']);
                    }
                });

                $scope.data = response.data;
                setTimeout(() => {
                    window.print();

                }, 250);
            });
        };
        $scope.loadPage($scope.filter);

        window.onafterprint = () => {
            messageHub.closeDialogWindow("codbex-assets-Reports-AssetAcquisitionDisposal-print");
        }

    }]);
