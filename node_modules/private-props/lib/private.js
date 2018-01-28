'use strict';

require('babel-polyfill');
/**
 * Simulate Private properties using WeakMap
 * @return [Function] sets or gets property from weakmap
 */
module.exports = function () {
    var properties = new WeakMap();
    var currentContext = {};

    return function (context) {

        if (!properties.has(context)) {
            properties.set(context, {});
            currentContext[context] = JSON.stringify(context);
        }

        if (JSON.stringify(context) != currentContext[context]) {
            return {};
        }

        return properties.get(context);
    };
};
//# sourceMappingURL=private.js.map
