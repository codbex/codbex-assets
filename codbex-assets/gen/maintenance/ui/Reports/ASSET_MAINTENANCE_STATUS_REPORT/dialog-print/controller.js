angular.module('page', ["ideUI", "ideView", "entityApi"])
    .config(["messageHubProvider", function (messageHubProvider) {
        messageHubProvider.eventIdPrefix = 'codbex-assets.Reports.ASSET_MAINTENANCE_STATUS_REPORT';
    }])
    .config(["entityApiProvider", function (entityApiProvider) {
        entityApiProvider.baseUrl = "/services/ts/codbex-assets/gen/maintenance/api/ASSET_MAINTENANCE_STATUS_REPORT/ASSET_MAINTENANCE_STATUS_REPORTService.ts";
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
                    messageHub.showAlertError("ASSET_MAINTENANCE_STATUS_REPORT", `Unable to list/filter ASSET_MAINTENANCE_STATUS_REPORT: '${response.message}'`);
                    return;
                }

                response.data.forEach(e => {
                    if (e['maintenanceMaintenancedate']) {
                        e['maintenanceMaintenancedate'] = new Date(e['maintenanceMaintenancedate']);
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
            messageHub.closeDialogWindow("codbex-assets-Reports-ASSET_MAINTENANCE_STATUS_REPORT-print");
        }

    }]);
