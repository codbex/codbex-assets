angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-plutus.entities.Disposal';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.DisposalDateFrom) {
				params.entity.DisposalDateFrom = new Date(params.entity.DisposalDateFrom);
			}
			if (params?.entity?.DisposalDateTo) {
				params.entity.DisposalDateTo = new Date(params.entity.DisposalDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsAsset = params.optionsAsset;
			$scope.optionsSalesInvoice = params.optionsSalesInvoice;
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
			if (entity.DisposalDateFrom) {
				filter.$filter.greaterThanOrEqual.DisposalDate = entity.DisposalDateFrom;
			}
			if (entity.DisposalDateTo) {
				filter.$filter.lessThanOrEqual.DisposalDate = entity.DisposalDateTo;
			}
			if (entity.Method) {
				filter.$filter.contains.Method = entity.Method;
			}
			if (entity.SaleValue !== undefined) {
				filter.$filter.equals.SaleValue = entity.SaleValue;
			}
			if (entity.Remarks) {
				filter.$filter.contains.Remarks = entity.Remarks;
			}
			if (entity.SalesInvoice !== undefined) {
				filter.$filter.equals.SalesInvoice = entity.SalesInvoice;
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
			messageHub.closeDialogWindow("Disposal-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);