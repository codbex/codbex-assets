angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-plutus.entities.Acquisitions';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.AcquisitionDateFrom) {
				params.entity.AcquisitionDateFrom = new Date(params.entity.AcquisitionDateFrom);
			}
			if (params?.entity?.AcquisitionDateTo) {
				params.entity.AcquisitionDateTo = new Date(params.entity.AcquisitionDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsAsset = params.optionsAsset;
			$scope.optionsSuplier = params.optionsSuplier;
		}

		$scope.filter = function () {
			let entity = $scope.entity;
			const filter = {
				$filter: {
					equals: {
					},
					notEquals: {
					},
					contains: {
					},
					greaterThan: {
					},
					greaterThanOrEqual: {
					},
					lessThan: {
					},
					lessThanOrEqual: {
					}
				},
			};
			if (entity.Id !== undefined) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.Asset !== undefined) {
				filter.$filter.equals.Asset = entity.Asset;
			}
			if (entity.AcquisitionDateFrom) {
				filter.$filter.greaterThanOrEqual.AcquisitionDate = entity.AcquisitionDateFrom;
			}
			if (entity.AcquisitionDateTo) {
				filter.$filter.lessThanOrEqual.AcquisitionDate = entity.AcquisitionDateTo;
			}
			if (entity.Suplier !== undefined) {
				filter.$filter.equals.Suplier = entity.Suplier;
			}
			if (entity.Cost !== undefined) {
				filter.$filter.equals.Cost = entity.Cost;
			}
			if (entity.PaymentMethod) {
				filter.$filter.contains.PaymentMethod = entity.PaymentMethod;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("Acquisitions-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);