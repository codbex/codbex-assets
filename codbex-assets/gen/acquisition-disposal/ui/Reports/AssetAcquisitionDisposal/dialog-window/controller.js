angular.module('page', ["ideUI", "ideView"])
	.controller('PageController', ['$scope', 'ViewParameters', function ($scope, ViewParameters) {

		$scope.entity = {};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = "select";;

			if (params.entity['acquisitionDate']) {
				params.entity['acquisitionDate'] = new Date(params.entity['acquisitionDate']);
			}
			if (params.entity['disposalDate']) {
				params.entity['disposalDate'] = new Date(params.entity['disposalDate']);
			}
			$scope.entity = params.entity;
		}

	}]);