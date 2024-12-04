const navigationData = {
    id: 'disposal-navigation',
    label: "Disposal",
    group: "assets",
    order: 600,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/Disposal/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }