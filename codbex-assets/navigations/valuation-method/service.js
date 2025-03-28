const navigationData = {
    id: 'valuation-method-navigation',
    label: "Valuation Method",
    group: "reference data",
    order: 2400,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/ValuationMethod/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }