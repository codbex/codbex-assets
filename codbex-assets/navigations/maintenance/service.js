const navigationData = {
    id: 'maintenance-navigation',
    label: "Maintenance",
    group: "assets",
    order: 400,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/Asset/Asset/Maintenance/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }