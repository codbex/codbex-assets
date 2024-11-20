const navigationData = {
    id: 'valuation-navigation',
    label: "Valuation",
    view: "valuation",
    group: "valuation",
    orderNumber: 1,
    lazyLoad: true,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/Asset/Asset/Valuation/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }