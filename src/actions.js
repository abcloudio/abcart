import * as ActionTypes from "./action-types";
const uuid = require("uuid/v4");

/**
 * Creates a new pending order in Stripe. An address is only required if the items are shippable
 * in Stripe.
 * @param {string} id - A unique id for this address, or the id of the address to update.
 * @param {object} address - An address object per Stripe documentation.
 * @param {boolean} isSelected - A boolean indicating if this should be set as the selected address.
 * @param {boolean} isNewAddress - A boolean indicating if this is a new address that should be saved.
 */
export const calculateShippingMethods = (
    id,
    { name, phone, line1, line2, city, state, postal_code, country },
    isSelected,
    isNewAddress
) => {
    return {
        type: ActionTypes.CALCULATE_SHIPPING_METHODS,
        payload: {
            id,
            name,
            phone,
            line1,
            line2,
            city,
            state,
            postal_code,
            country,
            isNewAddress,
            isSelected
        }
    };
};

/**
 * Change the shipping address of a pending Stripe order.
 * @param {string} selectedShippingMethod - Required. The Stripe id for a shipping method.
 * @param {string} orderId - Required. The Stripe order id.
 */
export const chooseShippingMethod = (selectedShippingMethod, orderId) => {
    return {
        type: ActionTypes.CHOOSE_SHIPPING_METHOD,
        payload: {
            selectedShippingMethod,
            orderId
        }
    };
};

// export const getCart = () => ({
//     type: ActionTypes.GET_CART
// });

/**
 * Pays for an order that has been created in Stripe.
 * @param {string} orderId - The Stripe generated order id.
 * @param {string} source - The payment source for the order. If this is not
 * provided then the default_source for the customer will be used. This may be either
 * the card id of a saved payment method or a new token.
 * @param {boolean} isNewCard - A boolean indicating if this is a new card token. If
 * set to true the card token will be saved to the users account.
 */
export const stripePayForOrder = (orderId, source, isNewCard) => ({
    type: ActionTypes.STRIPE_PAY_FOR_ORDER,
    payload: {
        orderId,
        source,
        isNewCard
    }
});

/**
 * Creates a new subscription for the authenticated user.
 * @param {array} items - An array of one or more plans to be subcribed to. For example
 * [{plan: "plan_abc123"}]. The plan must be created in your Stripe account.
 * @param {string} source - The payment source for the order. If this is not
 * provided then the default_source for the customer will be used. This may be either
 * the card id of a saved payment method or a new token.
 */
export const stripeSubscription = (items, source) => ({
    type: ActionTypes.STRIPE_SUBSCRIPTION,
    payload: {
        items,
        source
    }
});

/**
 * Saves a form.
 * @param {any} payload - Can be any type, will be saved as it is POSTed to the server.
 */
export const saveForm = payload => ({
    type: ActionTypes.SAVE_FORM,
    payload
});

/**
 * Creates or updates a saved address. Addresses should conform to Stripe documentation.
 * @param {string} id - A unique id for this address, or the id of the address to update.
 * @param {object} payload - An address object per Stripe documentation.
 * @param {boolean} isSelected - A boolean indicating if this should be set as the selected address.
 */
export const updateAddress = (
    id,
    { name, phone, line1, line2, city, state, postal_code, country },
    isSelected
) => ({
    type: ActionTypes.UPDATE_ADDRESS,
    payload: {
        id,
        name,
        phone,
        line1,
        line2,
        city,
        state,
        postal_code,
        country,
        isSelected
    }
});

/**
 * Creates or updates a cart item.
 * @param {string} sku - Required. The sku for a product already in Stripe.
 * @param {integer} quantity - Required. The quantity of the item. Set to 0 to remove the item from cart.
 * @param {object} metadata - An optional object of metadata to be returned in the cart with this item.
 */
export const updateCartItem = (sku, quantity, metadata) => {
    return {
        type: ActionTypes.UPDATE_CART_ITEM,
        payload: {
            updateId: uuid(),
            sku,
            quantity,
            metadata
        }
    };
};

/**
 * Updates or removes a payment method from the user's Stripe account.
 * @param {string} source - Required. A Stripe generated source token.
 * @param {boolean} removeCard - Boolean indicating if we should remove this payment method.
 */
export const updatePaymentMethod = (source, removeCard) => {
    return {
        type: ActionTypes.UPDATE_PAYMENT_METHOD,
        payload: {
            source,
            delete: removeCard
        }
    };
};

export const nextState = state => ({
    type: ActionTypes.NEXT_STATE,
    payload: state
});
