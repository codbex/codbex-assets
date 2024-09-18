angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-assets.Deprecation.Depreciation';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.DepreciationDateFrom) {
				params.entity.DepreciationDateFrom = new Date(params.entity.DepreciationDateFrom);
			}
			if (params?.entity?.DepreciationDateTo) {
				params.entity.DepreciationDateTo = new Date(params.entity.DepreciationDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsAsset = params.optionsAsset;
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
			if (entity.DepreciationDateFrom) {
				filter.$filter.greaterThanOrEqual.DepreciationDate = entity.DepreciationDateFrom;
			}
			if (entity.DepreciationDateTo) {
				filter.$filter.lessThanOrEqual.DepreciationDate = entity.DepreciationDateTo;
			}
			if (entity.Method) {
				filter.$filter.contains.Method = entity.Method;
			}
			if (entity.AnnualDepreciation !== undefined) {
				filter.$filter.equals.AnnualDepreciation = entity.AnnualDepreciation;
			}
			if (entity.AccumulatedDepreciation !== undefined) {
				filter.$filter.equals.AccumulatedDepreciation = entity.AccumulatedDepreciation;
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
			messageHub.closeDialogWindow("Depreciation-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);