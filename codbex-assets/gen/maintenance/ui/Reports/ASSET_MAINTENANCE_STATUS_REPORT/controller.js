angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-assets.Reports.ASSET_MAINTENANCE_STATUS_REPORT';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-assets/gen/maintenance/api/ASSET_MAINTENANCE_STATUS_REPORT/ASSET_MAINTENANCE_STATUS_REPORTService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'entityApi', 'Extensions', function ($scope, messageHub, entityApi, Extensions) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataLimit = 20;

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-assets-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "Reports" && e.view === "ASSET_MAINTENANCE_STATUS_REPORT" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "Reports" && e.view === "ASSET_MAINTENANCE_STATUS_REPORT" && e.type === "entity");
		});

		$scope.triggerPageAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					filterEntity: $scope.filterEntity,
				},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("entitySearch", function (msg) {
			resetPagination();
			$scope.filter = msg.data.filter;
			$scope.filterEntity = msg.data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber, filter) {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			$scope.dataPage = pageNumber;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("ASSET_MAINTENANCE_STATUS_REPORT", `Unable to count ASSET_MAINTENANCE_STATUS_REPORT: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				let request;
				if (filter) {
					filter.$offset = offset;
					filter.$limit = limit;
					request = entityApi.search(filter);
				} else {
					request = entityApi.list(offset, limit);
				}
				request.then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("ASSET_MAINTENANCE_STATUS_REPORT", `Unable to list/filter ASSET_MAINTENANCE_STATUS_REPORT: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
					});

					$scope.data = response.data;
				});
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("ASSET_MAINTENANCE_STATUS_REPORT-Report-details", {
				action: "select",
				entity: entity,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("ASSET_MAINTENANCE_STATUS_REPORT-Report-filter", {
				entity: $scope.filterEntity,
			});
		};
	}]);
