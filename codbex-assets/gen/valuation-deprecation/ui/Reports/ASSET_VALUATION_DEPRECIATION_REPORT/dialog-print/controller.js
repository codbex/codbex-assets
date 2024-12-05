angular.module('page', ["ideUI", "ideView", "entityApi"])
    .config(["messageHubProvider", function (messageHubProvider) {
        messageHubProvider.eventIdPrefix = 'codbex-assets.Reports.ASSET_VALUATION_DEPRECIATION_REPORT';
    }])
    .config(["entityApiProvider", function (entityApiProvider) {
        entityApiProvider.baseUrl = "/services/ts/codbex-assets/gen/valuation-deprecation/api/ASSET_VALUATION_DEPRECIATION_REPORT/ASSET_VALUATION_DEPRECIATION_REPORTService.ts";
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
                    messageHub.showAlertError("ASSET_VALUATION_DEPRECIATION_REPORT", `Unable to list/filter ASSET_VALUATION_DEPRECIATION_REPORT: '${response.message}'`);
                    return;
                }

                response.data.forEach(e => {
                    if (e['depreciationDepreciationdate']) {
                        e['depreciationDepreciationdate'] = new Date(e['depreciationDepreciationdate']);
                    }
                    if (e['valuationValuationdate']) {
                        e['valuationValuationdate'] = new Date(e['valuationValuationdate']);
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
            messageHub.closeDialogWindow("codbex-assets-Reports-ASSET_VALUATION_DEPRECIATION_REPORT-print");
        }

    }]);
