import connectServer from "./connect-server";
import {
    calculateShippingMethods,
    chooseShippingMethod,
    stripePayForOrder,
    stripeSubscription,
    saveForm,
    updateAddress,
    updateCartItem,
    updatePaymentMethod
} from "./actions";

module.exports = ({ appId, apikey, token }) => {
    const { store, dispatch } = connectServer({
        appId,
        apikey,
        token
    });
    return {
        store,
        actions: {
            calculateShippingMethods: dispatch(calculateShippingMethods),
            chooseShippingMethod: dispatch(chooseShippingMethod),
            stripePayForOrder: dispatch(stripePayForOrder),
            stripeSubscription: dispatch(stripeSubscription),
            saveForm: dispatch(saveForm),
            updateAddress: dispatch(updateAddress),
            updateCartItem: dispatch(updateCartItem),
            updatePaymentMethod: dispatch(updatePaymentMethod)

            // just refresh the state
            // refresh: dispatch(getState)
        },
        // calling connect will allow subscribers to subscribe and unsubscribe at will
        // while preserving the last store value even if no subscribers are connected
        // it returns a subscripion that can be closed with subscription.unsubscribe()
        connect: () => store.connect()
    };
};
