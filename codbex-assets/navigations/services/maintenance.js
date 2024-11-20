const navigationData = {
    id: 'maintenance-navigation',
    label: "Maintenance",
    view: "maintenance",
    group: "maintenance",
    orderNumber: 1,
    lazyLoad: true,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/Asset/Asset/Maintenance/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }