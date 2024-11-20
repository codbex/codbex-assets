const navigationData = {
    id: 'acquisition-navigation',
    label: "Acquisition",
    view: "acquisition",
    group: "acquisition",
    orderNumber: 1,
    lazyLoad: true,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/AcquisitionRequest/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }