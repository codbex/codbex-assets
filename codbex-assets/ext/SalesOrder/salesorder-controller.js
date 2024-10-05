const widgetsView = angular.module('widgets', ['ideUI', 'ideView']);

widgetsView.config(["messageHubProvider", function (messageHubProvider) {
    messageHubProvider.eventIdPrefix = 'codbex-assets';
}]);

widgetsView.controller('WidgetsViewController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, ViewParameters, messageHub) {

    $scope.entity = {};
    $scope.forms = {
        details: {},
    };
    $scope.formHeaders = {
        select: "SalesOrder Details",
        create: "Create SalesOrder",
        update: "Update SalesOrder"
    };
    $scope.action = 'create'; // default action to create

    // Initialize options for the dropdowns
    $scope.optionsCustomer = [];
    $scope.optionsSentMethod = [];
    $scope.optionsOperator = [];

    // Fetch dropdown data using GET requests
    $scope.loadDropdownOptions = function () {
        // Fetch Customer options
        $http.get('http://localhost:8080/services/ts/codbex-partners/gen/codbex-partners/api/Customers/CustomerService.ts')
            .then(function (response) {
                if (Array.isArray(response.data)) {
                    $scope.optionsCustomer = response.data.map(function (item) {
                        return { value: item.Id, text: item.Name };  // Adjusted to { value, text }
                    });
                } else {
                    console.error('Unexpected response format for Customer:', response.data);
                }
            })
            .catch(function (error) {
                console.error("Error fetching Customer options:", error);
            });

        // Fetch SentMethod options
        $http.get('http://localhost:8080/services/ts/codbex-methods/gen/codbex-methods/api/Methods/SentMethodService.ts')
            .then(function (response) {
                if (Array.isArray(response.data)) {
                    $scope.optionsSentMethod = response.data.map(function (item) {
                        return { value: item.Id, text: item.Name };  // Adjusted to { value, text }
                    });
                } else {
                    console.error('Unexpected response format for SentMethod:', response.data);
                }
            })
            .catch(function (error) {
                console.error("Error fetching SentMethod options:", error);
            });

        // Fetch Operator options
        $http.get('http://localhost:8080/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts')
            .then(function (response) {
                if (Array.isArray(response.data)) {
                    $scope.optionsOperator = response.data.map(function (item) {
                        return { value: item.Id, text: item.Name };  // Adjusted to { value, text }
                    });
                } else {
                    console.error('Unexpected response format for Operator:', response.data);
                }
            })
            .catch(function (error) {
                console.error("Error fetching Operator options:", error);
            });
    };

    // Load options on controller initialization
    $scope.loadDropdownOptions();

    $scope.generateSalesOrder = function () {
        const params = ViewParameters.get();

        if (!params || !params.id) {
            console.error('Invalid or missing ViewParameters.');
            alert('Invalid or missing ViewParameters.');
            return;
        }

        const disposalUrl = "http://localhost:8080/services/ts/codbex-assets/gen/codbex-assets/api/Disposal/DisposalService.ts/";
        const assetUrl = "http://localhost:8080/services/ts/codbex-assets/gen/codbex-assets/api/Asset/AssetService.ts/";
        const salesOrderUrl = "http://localhost:8080/services/ts/codbex-orders/gen/codbex-orders/api/SalesOrder/SalesOrderService.ts";

        $http.get(disposalUrl + params.id)
            .then(function (response) {
                if (!response.data || !response.data.Asset)
                    throw new Error('Invalid disposal response: Missing asset information.');

                return $http.get(assetUrl + response.data.Asset); // Getting the Asset info
            })
            .then(function (response2) {
                if (!response2.data)
                    throw new Error('Invalid asset response: Missing product information.');

                const salesOrderData = {
                    Date: new Date().toISOString(),
                    Due: $scope.entity.Due, // Due Date from form
                    Currency: 30, //BGN
                    Customer: $scope.entity.Customer, // Customer from form
                    Operator: $scope.entity.Operator, // Operator from form
                    SalesOrderStatus: 1, // NEW
                    SentMethod: $scope.entity.SentMethod, // SentMethod from form
                    Store: response2.data.Store || 0 // Handling case where no store was found
                };

                return $http.post(salesOrderUrl, salesOrderData);
            })
            .then(function () {
                messageHub.closeDialogWindow('assets-sales-order');
                messageHub.triggerEvent('entityUpdated');
                messageHub.showAlertSuccess(
                    "Successfully generated Sales Order",
                    "Sales Order has been generated!"
                );
            })
            .catch(function (error) {
                console.error('Error during Sales Order generation:', error);
                if (error.data) alert('An error occurred: ' + (error.data.message || 'Unknown error.'));
                else alert('Failed to generate Sales Order. Please try again later.');
            });
    };

    $scope.closeDialog = function () {
        messageHub.closeDialogWindow('assets-sales-order');
    };

    // Watch for changes in the form's validity to manage button states
    $scope.$watch('forms.details.$valid', function (newVal) {
        $scope.generateButtonState = newVal ? 'normal' : 'disabled';
    });
}]);
