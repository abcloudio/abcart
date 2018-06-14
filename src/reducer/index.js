import * as ActionTypes from "../action-types";
import mergeCartFromServer from "./merge-cart-from-server";
import pendingRequests from "./pending-requests";
import mergeErrors from "./merge-errors";

// we should look into make the store schema more explicit
export default (state, action) => {
    switch (action.type) {
        case ActionTypes.NEXT_STATE:
            return {
                //...state,
                ...action.payload,
                cart: mergeCartFromServer(action.payload.cart, state.cart),
                ...(state.stripeSubscription &&
                // this indicates that we have added a new subscription since the last state
                // change
                state.subscriptions.length < action.payload.subscriptions
                    ? {
                          stripeSubscription: {
                              status: "success"
                          }
                      }
                    : {}),
                ...(state.placeOrder &&
                state.placeOrder.status === "inFlightRequest"
                    ? { placeOrder: { status: "success" } }
                    : {}),
                ...(state.updatePaymentMethod &&
                state.updatePaymentMethod.status === "inFlightRequest"
                    ? { updatePaymentMethod: { status: "success" } }
                    : {}),
                ...(state.updateAddress &&
                state.updateAddress.status === "inFlightRequest"
                    ? { updateAddress: { status: "success" } }
                    : {}),
                ...(state.chooseShippingMethod &&
                state.chooseShippingMethod.status === "inFlightRequest"
                    ? { chooseShippingMethod: { status: "success" } }
                    : {})
            };
        case ActionTypes.PENDING_REQUEST:
            return pendingRequests(state, action);
        case ActionTypes.ERROR:
            // and here should be the error for the eventId that triggered it
            return mergeErrors(state, action);
        default:
            return state;
    }
};
