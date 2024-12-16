const navigationData = {
    id: 'maintenance-status-navigation',
    label: "Maintenance Status",
    group: "reference data",
    order: 2100,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/MaintenanceStatus/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }