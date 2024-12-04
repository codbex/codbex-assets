angular.module('page', ["ideUI", "ideView"])
	.controller('PageController', ['$scope', 'ViewParameters', function ($scope, ViewParameters) {

		$scope.entity = {};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = "select";;

			if (params.entity['maintenanceMaintenancedate']) {
				params.entity['maintenanceMaintenancedate'] = new Date(params.entity['maintenanceMaintenancedate']);
			}
			$scope.entity = params.entity;
		}

	}]);