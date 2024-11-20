const navigationData = {
    id: 'deprecation-navigation',
    label: "Deprecation",
    view: "deprecation",
    group: "deprecation",
    orderNumber: 1,
    lazyLoad: true,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/Asset/Asset/Deprecation/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }