angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-plutus.entities.Acquisitions';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-plutus/gen/edm/api/entities/AcquisitionsService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataLimit = 20;

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-plutus-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "entities" && e.view === "Acquisitions" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "entities" && e.view === "Acquisitions" && e.type === "entity");
		});

		$scope.triggerPageAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{},
				null,
				true,
				action
			);
		};

		$scope.triggerEntityAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					id: $scope.entity.Id
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
		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

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
					messageHub.showAlertError("Acquisitions", `Unable to count Acquisitions: '${response.message}'`);
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
						messageHub.showAlertError("Acquisitions", `Unable to list/filter Acquisitions: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.AcquisitionDate) {
							e.AcquisitionDate = new Date(e.AcquisitionDate);
						}
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
			messageHub.showDialogWindow("Acquisitions-details", {
				action: "select",
				entity: entity,
				optionsAsset: $scope.optionsAsset,
				optionsSuplier: $scope.optionsSuplier,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("Acquisitions-filter", {
				entity: $scope.filterEntity,
				optionsAsset: $scope.optionsAsset,
				optionsSuplier: $scope.optionsSuplier,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Acquisitions-details", {
				action: "create",
				entity: {},
				optionsAsset: $scope.optionsAsset,
				optionsSuplier: $scope.optionsSuplier,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Acquisitions-details", {
				action: "update",
				entity: entity,
				optionsAsset: $scope.optionsAsset,
				optionsSuplier: $scope.optionsSuplier,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Acquisitions?',
				`Are you sure you want to delete Acquisitions? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("Acquisitions", `Unable to delete Acquisitions: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsAsset = [];
		$scope.optionsSuplier = [];


		$http.get("/services/ts/codbex-plutus/gen/edm/api/entities/AssetService.ts").then(function (response) {
			$scope.optionsAsset = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-plutus/gen/edm/api/entities/SupliersService.ts").then(function (response) {
			$scope.optionsSuplier = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsAssetValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsAsset.length; i++) {
				if ($scope.optionsAsset[i].value === optionKey) {
					return $scope.optionsAsset[i].text;
				}
			}
			return null;
		};
		$scope.optionsSuplierValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsSuplier.length; i++) {
				if ($scope.optionsSuplier[i].value === optionKey) {
					return $scope.optionsSuplier[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
