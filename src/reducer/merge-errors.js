import * as ActionTypes from "../action-types";

const prepareError = (state, error) => key => {
    return {
        ...state,
        [key]: {
            status: "error",
            error
        }
    };
};

export default (state, action) => {
    const setKey = prepareError(state, action.payload.message);

    switch (action.payload.action.type) {
        case ActionTypes.UPDATE_CART_ITEM:
            return {
                ...state,
                cart: state.cart.map(item => {
                    return item.sku === action.payload.action.payload.sku
                        ? {
                              ...item,
                              pending: {
                                  ...item.pending,
                                  error: action.payload.message
                              }
                          }
                        : item;
                })
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
