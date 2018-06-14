import * as ActionTypes from "../action-types";

export default (serverCart, localCart) => {
    return serverCart.map(item => {
        const updateId = item.updateId;
        const itemFromServer = Object.keys(item).reduce((acc, key) => {
            if (key !== "updateId") {
                return {
                    ...acc,
                    [key]: item[key]
                };
            }
            return acc;
        }, {});
        // here we merge in any pending updates to items that are still in-flight
        // pending deletes will just "go away", because we are mapping through server items
        const current = localCart.find(
            currentItem => currentItem.sku === itemFromServer.sku
        );

        if (
            current &&
            current.pending &&
            current.pending.updateId === updateId
        ) {
            // we've complete the update cycle return the new item and
            // remove the update stuff
            return itemFromServer;
        } else if (current && current.pending) {
            return {
                ...current,
                // replace anything that might be new from the server, but
                // keep our update payload because it will come back soon
                ...itemFromServer
            };
        } else return itemFromServer;
    });
};
