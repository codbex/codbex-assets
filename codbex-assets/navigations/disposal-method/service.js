const navigationData = {
    id: 'disposal-method-navigation',
    label: "Disposal Method",
    group: "reference data",
    order: 2200,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/DisposalMethod/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }