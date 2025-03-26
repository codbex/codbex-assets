angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-assets.Asset.Asset';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-assets/gen/codbex-assets/api/Asset/AssetService.ts";
	}])
	.controller('PageController', ['$scope',  '$http', 'Extensions', 'messageHub', 'entityApi', function ($scope,  $http, Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "Asset Details",
			create: "Create Asset",
			update: "Update Asset"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-assets-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "Asset" && e.view === "Asset" && e.type === "entity");
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
				$scope.optionsProduct = [];
				$scope.optionsStore = [];
				$scope.optionsPurchaseInvoice = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.PurchaseDate) {
					msg.data.entity.PurchaseDate = new Date(msg.data.entity.PurchaseDate);
				}
				if (msg.data.entity.UsefulLife) {
					msg.data.entity.UsefulLife = new Date(msg.data.entity.UsefulLife);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsProduct = msg.data.optionsProduct;
				$scope.optionsStore = msg.data.optionsStore;
				$scope.optionsPurchaseInvoice = msg.data.optionsPurchaseInvoice;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsProduct = msg.data.optionsProduct;
				$scope.optionsStore = msg.data.optionsStore;
				$scope.optionsPurchaseInvoice = msg.data.optionsPurchaseInvoice;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.PurchaseDate) {
					msg.data.entity.PurchaseDate = new Date(msg.data.entity.PurchaseDate);
				}
				if (msg.data.entity.UsefulLife) {
					msg.data.entity.UsefulLife = new Date(msg.data.entity.UsefulLife);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsProduct = msg.data.optionsProduct;
				$scope.optionsStore = msg.data.optionsStore;
				$scope.optionsPurchaseInvoice = msg.data.optionsPurchaseInvoice;
				$scope.action = 'update';
			});
		});

		$scope.serviceProduct = "/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts";
		$scope.serviceStore = "/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts";
		$scope.servicePurchaseInvoice = "/services/ts/codbex-invoices/gen/codbex-invoices/api/purchaseinvoice/PurchaseInvoiceService.ts";

		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("Asset", `Unable to create Asset: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Asset", "Asset successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Asset", `Unable to update Asset: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Asset", "Asset successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};
		
		//-----------------Dialogs-------------------//
		
		$scope.createProduct = function () {
			messageHub.showDialogWindow("Product-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createStore = function () {
			messageHub.showDialogWindow("Store-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createPurchaseInvoice = function () {
			messageHub.showDialogWindow("PurchaseInvoice-details", {
				action: "create",
				entity: {},
			}, null, false);
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshProduct = function () {
			$scope.optionsProduct = [];
			$http.get("/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts").then(function (response) {
				$scope.optionsProduct = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshStore = function () {
			$scope.optionsStore = [];
			$http.get("/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts").then(function (response) {
				$scope.optionsStore = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshPurchaseInvoice = function () {
			$scope.optionsPurchaseInvoice = [];
			$http.get("/services/ts/codbex-invoices/gen/codbex-invoices/api/purchaseinvoice/PurchaseInvoiceService.ts").then(function (response) {
				$scope.optionsPurchaseInvoice = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};

		//----------------Dropdowns-----------------//	
		

	}]);