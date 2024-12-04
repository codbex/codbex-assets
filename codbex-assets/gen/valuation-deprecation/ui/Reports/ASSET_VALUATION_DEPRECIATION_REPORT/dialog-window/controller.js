angular.module('page', ["ideUI", "ideView"])
	.controller('PageController', ['$scope', 'ViewParameters', function ($scope, ViewParameters) {

		$scope.entity = {};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = "select";;

			if (params.entity['depreciationDepreciationdate']) {
				params.entity['depreciationDepreciationdate'] = new Date(params.entity['depreciationDepreciationdate']);
			}
			if (params.entity['valuationValuationdate']) {
				params.entity['valuationValuationdate'] = new Date(params.entity['valuationValuationdate']);
			}
			$scope.entity = params.entity;
		}

	}]);