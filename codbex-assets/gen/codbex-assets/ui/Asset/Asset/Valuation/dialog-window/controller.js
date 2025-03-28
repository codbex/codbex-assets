angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-assets.Asset.Valuation';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-assets/gen/codbex-assets/api/Asset/ValuationService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', 'entityApi', function ($scope, messageHub, ViewParameters, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "Valuation Details",
			create: "Create Valuation",
			update: "Update Valuation"
		};
		$scope.action = 'select';

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;

			if (params.entity.ValuationDate) {
				params.entity.ValuationDate = new Date(params.entity.ValuationDate);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsAsset = params.optionsAsset;
			$scope.optionsValuationMethod = params.optionsValuationMethod;
			$scope.optionsSupplier = params.optionsSupplier;
		}

		$scope.create = function () {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.create(entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("Valuation", `Unable to create Valuation: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("Valuation", "Valuation successfully created");
			});
		};

		$scope.update = function () {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.update(id, entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Valuation", `Unable to update Valuation: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("Valuation", "Valuation successfully updated");
			});
		};

		$scope.serviceAsset = "/services/ts/codbex-assets/gen/codbex-assets/api/Asset/AssetService.ts";
		$scope.serviceValuationMethod = "/services/ts/codbex-assets/gen/codbex-assets/api/Settings/ValuationMethodService.ts";
		$scope.serviceSupplier = "/services/ts/codbex-partners/gen/codbex-partners/api/Suppliers/SupplierService.ts";

		$scope.cancel = function () {
			$scope.entity = {};
			$scope.action = 'select';
			messageHub.closeDialogWindow("Valuation-details");
		};

	}]);