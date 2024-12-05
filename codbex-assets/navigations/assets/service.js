const navigationData = {
    id: 'assets-navigation',
    label: "Assets",
    group: "assets",
    order: 100,
    link: "/services/web/codbex-assets/gen/codbex-assets/ui/Asset/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }