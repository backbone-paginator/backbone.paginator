const plugins = [
    ["@babel/plugin-transform-modules-umd", {
        "exactGlobals": true,
        "globals": {
            "backbone.paginator": "Backbone.PageableCollection",
            "underscore": "_",
            "backbone": "Backbone"
        }
    }]
];

const presets = [
    ["@babel/env", {
        useBuiltIns: false
    }]
];

module.exports = function (api) {
    api.cache(true);

    return {
        plugins,
        presets
    };
};
