const navigationData = {
    id: 'valuation-navigation',
    label: "Valuation",
    group: "assets",
    order: 500,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/Asset/Asset/Valuation/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }