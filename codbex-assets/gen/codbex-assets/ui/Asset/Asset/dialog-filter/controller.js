angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-assets.Asset.Asset';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.PurchaseDateFrom) {
				params.entity.PurchaseDateFrom = new Date(params.entity.PurchaseDateFrom);
			}
			if (params?.entity?.PurchaseDateTo) {
				params.entity.PurchaseDateTo = new Date(params.entity.PurchaseDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsProduct = params.optionsProduct;
			$scope.optionsStore = params.optionsStore;
			$scope.optionsPurchaseInvoice = params.optionsPurchaseInvoice;
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
			if (entity.Name) {
				filter.$filter.contains.Name = entity.Name;
			}
			if (entity.Company !== undefined) {
				filter.$filter.equals.Company = entity.Company;
			}
			if (entity.SerialNumber) {
				filter.$filter.contains.SerialNumber = entity.SerialNumber;
			}
			if (entity.PurchaseDateFrom) {
				filter.$filter.greaterThanOrEqual.PurchaseDate = entity.PurchaseDateFrom;
			}
			if (entity.PurchaseDateTo) {
				filter.$filter.lessThanOrEqual.PurchaseDate = entity.PurchaseDateTo;
			}
			if (entity.AquiredValue !== undefined) {
				filter.$filter.equals.AquiredValue = entity.AquiredValue;
			}
			if (entity.AccumulatedValue !== undefined) {
				filter.$filter.equals.AccumulatedValue = entity.AccumulatedValue;
			}
			if (entity.Product !== undefined) {
				filter.$filter.equals.Product = entity.Product;
			}
			if (entity.Store !== undefined) {
				filter.$filter.equals.Store = entity.Store;
			}
			if (entity.MaintenenceCost !== undefined) {
				filter.$filter.equals.MaintenenceCost = entity.MaintenenceCost;
			}
			if (entity.PurchaseInvoice !== undefined) {
				filter.$filter.equals.PurchaseInvoice = entity.PurchaseInvoice;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			messageHub.postMessage("clearDetails");
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("Asset-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);