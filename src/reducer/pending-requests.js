import * as ActionTypes from "../action-types";

const preparePending = state => key => {
    return {
        ...state,
        [key]: {
            status: "requestInFlight"
        }
    };
};

export default (state, action) => {
    const setKey = preparePending(state, action.payload.message);

    switch (action.payload.type) {
        case ActionTypes.UPDATE_CART_ITEM:
            const pending = Object.keys(action.payload.payload).reduce(
                (acc, key) => {
                    if (key !== "signature") {
                        return {
                            ...acc,
                            [key]: action.payload.payload[key]
                        };
                    }
                    return acc;
                },
                {}
            );
            return {
                ...state,
                cart:
                    state.cart.findIndex(
                        item => item.sku === action.payload.payload.sku
                    ) > -1 // update the item
                        ? state.cart.map(item => {
                              return item.sku === action.payload.payload.sku
                                  ? {
                                        ...item,
                                        pending
                                    }
                                  : item;
                          }) // if it didn't exist in the cart the we should add it as pending
                        : [...state.cart, { sku: pending.sku, pending }]
            };
            break;

        case ActionTypes.CALCULATE_SHIPPING_METHODS:
            return setKey("calculateShippingMethods");

        case ActionTypes.CHOOSE_SHIPPING_METHOD:
            return setKey("chooseShippingMethod");

        case ActionTypes.STRIPE_PAY_FOR_ORDER:
            return setKey("stripePayForOrder");

        case ActionTypes.STRIPE_SUBSCRIPTION:
            return setKey("stripeSubscription");

        case ActionTypes.SAVE_FORM:
            return setKey("saveForm");

        case ActionTypes.UPDATE_ADDRESS:
            return setKey("updateAddress");

        case ActionTypes.UPDATE_PAYMENT_METHOD:
            return setKey("updatePaymentMethod");

        default:
            return state;
    }
};
