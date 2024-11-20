const navigationData = {
    id: 'disposal-method-navigation',
    label: "Disposal Method",
    view: "disposal-method",
    group: "disposal-method",
    orderNumber: 1,
    lazyLoad: true,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/DisposalMethod/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }