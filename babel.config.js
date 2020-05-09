const plugins = [
    "@babel/plugin-transform-runtime"
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
