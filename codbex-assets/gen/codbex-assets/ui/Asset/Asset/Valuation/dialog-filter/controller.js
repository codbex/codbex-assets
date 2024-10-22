angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-assets.Asset.Valuation';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.ValuationDateFrom) {
				params.entity.ValuationDateFrom = new Date(params.entity.ValuationDateFrom);
			}
			if (params?.entity?.ValuationDateTo) {
				params.entity.ValuationDateTo = new Date(params.entity.ValuationDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsAsset = params.optionsAsset;
			$scope.optionsValuationMethod = params.optionsValuationMethod;
			$scope.optionsSupplier = params.optionsSupplier;
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
			if (entity.ValuationDateFrom) {
				filter.$filter.greaterThanOrEqual.ValuationDate = entity.ValuationDateFrom;
			}
			if (entity.ValuationDateTo) {
				filter.$filter.lessThanOrEqual.ValuationDate = entity.ValuationDateTo;
			}
			if (entity.ValuedAt !== undefined) {
				filter.$filter.equals.ValuedAt = entity.ValuedAt;
			}
			if (entity.ValuationMethod !== undefined) {
				filter.$filter.equals.ValuationMethod = entity.ValuationMethod;
			}
			if (entity.Remarks) {
				filter.$filter.contains.Remarks = entity.Remarks;
			}
			if (entity.Supplier !== undefined) {
				filter.$filter.equals.Supplier = entity.Supplier;
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
			messageHub.closeDialogWindow("Valuation-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);