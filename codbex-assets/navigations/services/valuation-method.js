const navigationData = {
    id: 'valuation-method-navigation',
    label: "Valuation Method",
    view: "valuation-method",
    group: "valuation-method",
    orderNumber: 1,
    lazyLoad: true,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/ValuationMethod/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }