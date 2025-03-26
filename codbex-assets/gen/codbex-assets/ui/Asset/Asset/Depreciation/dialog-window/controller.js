angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-assets.Asset.Depreciation';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-assets/gen/codbex-assets/api/Asset/DepreciationService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', 'entityApi', function ($scope, messageHub, ViewParameters, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "Depreciation Details",
			create: "Create Depreciation",
			update: "Update Depreciation"
		};
		$scope.action = 'select';

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;

			if (params.entity.DepreciationStartDate) {
				params.entity.DepreciationStartDate = new Date(params.entity.DepreciationStartDate);
			}
			if (params.entity.DeprecationEndDate) {
				params.entity.DeprecationEndDate = new Date(params.entity.DeprecationEndDate);
			}
			if (params.entity.LastDeprecationDate) {
				params.entity.LastDeprecationDate = new Date(params.entity.LastDeprecationDate);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsAsset = params.optionsAsset;
			$scope.optionsDeprecationSchedule = params.optionsDeprecationSchedule;
		}

		$scope.create = function () {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.create(entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("Depreciation", `Unable to create Depreciation: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("Depreciation", "Depreciation successfully created");
			});
		};

		$scope.update = function () {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.update(id, entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Depreciation", `Unable to update Depreciation: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("Depreciation", "Depreciation successfully updated");
			});
		};

		$scope.serviceAsset = "/services/ts/codbex-assets/gen/codbex-assets/api/Asset/AssetService.ts";
		$scope.serviceDeprecationSchedule = "/services/ts/codbex-assets/gen/codbex-assets/api/Settings/DeprecationScheduleService.ts";

		$scope.cancel = function () {
			$scope.entity = {};
			$scope.action = 'select';
			messageHub.closeDialogWindow("Depreciation-details");
		};

	}]);