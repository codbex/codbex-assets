angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-plutus.entities.Asset';
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
			$scope.optionsLocation = params.optionsLocation;
			$scope.optionsCategory = params.optionsCategory;
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
			if (entity.Location !== undefined) {
				filter.$filter.equals.Location = entity.Location;
			}
			if (entity.Category !== undefined) {
				filter.$filter.equals.Category = entity.Category;
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
			if (entity.Status) {
				filter.$filter.contains.Status = entity.Status;
			}
			if (entity.Value !== undefined) {
				filter.$filter.equals.Value = entity.Value;
			}
			if (entity.Product !== undefined) {
				filter.$filter.equals.Product = entity.Product;
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
			messageHub.closeDialogWindow("Asset-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);