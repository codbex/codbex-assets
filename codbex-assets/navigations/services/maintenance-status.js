const navigationData = {
    id: 'maintenance-status-navigation',
    label: "Maintenance Status",
    view: "maintenance-status",
    group: "maintenance-status",
    orderNumber: 1,
    lazyLoad: true,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/MaintenanceStatus/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }