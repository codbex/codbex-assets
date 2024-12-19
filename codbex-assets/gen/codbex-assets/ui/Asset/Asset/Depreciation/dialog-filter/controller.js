angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-assets.Asset.Depreciation';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.DepreciationStartDateFrom) {
				params.entity.DepreciationStartDateFrom = new Date(params.entity.DepreciationStartDateFrom);
			}
			if (params?.entity?.DepreciationStartDateTo) {
				params.entity.DepreciationStartDateTo = new Date(params.entity.DepreciationStartDateTo);
			}
			if (params?.entity?.DeprecationEndDateFrom) {
				params.entity.DeprecationEndDateFrom = new Date(params.entity.DeprecationEndDateFrom);
			}
			if (params?.entity?.DeprecationEndDateTo) {
				params.entity.DeprecationEndDateTo = new Date(params.entity.DeprecationEndDateTo);
			}
			if (params?.entity?.LastDeprecationDateFrom) {
				params.entity.LastDeprecationDateFrom = new Date(params.entity.LastDeprecationDateFrom);
			}
			if (params?.entity?.LastDeprecationDateTo) {
				params.entity.LastDeprecationDateTo = new Date(params.entity.LastDeprecationDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsAsset = params.optionsAsset;
			$scope.optionsDeprecationSchedule = params.optionsDeprecationSchedule;
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
			if (entity.DepreciationStartDateFrom) {
				filter.$filter.greaterThanOrEqual.DepreciationStartDate = entity.DepreciationStartDateFrom;
			}
			if (entity.DepreciationStartDateTo) {
				filter.$filter.lessThanOrEqual.DepreciationStartDate = entity.DepreciationStartDateTo;
			}
			if (entity.DeprecationEndDateFrom) {
				filter.$filter.greaterThanOrEqual.DeprecationEndDate = entity.DeprecationEndDateFrom;
			}
			if (entity.DeprecationEndDateTo) {
				filter.$filter.lessThanOrEqual.DeprecationEndDate = entity.DeprecationEndDateTo;
			}
			if (entity.DeprecationSchedule !== undefined) {
				filter.$filter.equals.DeprecationSchedule = entity.DeprecationSchedule;
			}
			if (entity.LastDeprecationDateFrom) {
				filter.$filter.greaterThanOrEqual.LastDeprecationDate = entity.LastDeprecationDateFrom;
			}
			if (entity.LastDeprecationDateTo) {
				filter.$filter.lessThanOrEqual.LastDeprecationDate = entity.LastDeprecationDateTo;
			}
			if (entity.DeprecationRate !== undefined) {
				filter.$filter.equals.DeprecationRate = entity.DeprecationRate;
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