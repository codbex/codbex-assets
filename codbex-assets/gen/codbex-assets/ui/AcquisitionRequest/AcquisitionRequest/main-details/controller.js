angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-assets.AcquisitionRequest.AcquisitionRequest';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-assets/gen/codbex-assets/api/AcquisitionRequest/AcquisitionRequestService.ts";
	}])
	.controller('PageController', ['$scope',  '$http', 'Extensions', 'messageHub', 'entityApi', function ($scope,  $http, Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "AcquisitionRequest Details",
			create: "Create AcquisitionRequest",
			update: "Update AcquisitionRequest"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-assets-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "AcquisitionRequest" && e.view === "AcquisitionRequest" && e.type === "entity");
		});

		$scope.triggerEntityAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					id: $scope.entity.Id
				},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsAsset = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.AcquisitionDate) {
					msg.data.entity.AcquisitionDate = new Date(msg.data.entity.AcquisitionDate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsAsset = msg.data.optionsAsset;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsAsset = msg.data.optionsAsset;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.AcquisitionDate) {
					msg.data.entity.AcquisitionDate = new Date(msg.data.entity.AcquisitionDate);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsAsset = msg.data.optionsAsset;
				$scope.action = 'update';
			});
		});

		$scope.serviceAsset = "/services/ts/codbex-assets/gen/codbex-assets/api/Asset/AssetService.ts";

		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("AcquisitionRequest", `Unable to create AcquisitionRequest: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("AcquisitionRequest", "AcquisitionRequest successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("AcquisitionRequest", `Unable to update AcquisitionRequest: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("AcquisitionRequest", "AcquisitionRequest successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};
		
		//-----------------Dialogs-------------------//
		
		$scope.createAsset = function () {
			messageHub.showDialogWindow("Asset-details", {
				action: "create",
				entity: {},
			}, null, false);
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshAsset = function () {
			$scope.optionsAsset = [];
			$http.get("/services/ts/codbex-assets/gen/codbex-assets/api/Asset/AssetService.ts").then(function (response) {
				$scope.optionsAsset = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};

		//----------------Dropdowns-----------------//	
		

	}]);