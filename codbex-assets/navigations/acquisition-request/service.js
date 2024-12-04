const navigationData = {
    id: 'acquisition-navigation',
    label: "Acquisition",
    group: "assets",
    order: 200,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/AcquisitionRequest/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }