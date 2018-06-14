### abcart

This repository holds the `abcart` javascript SDK. It is build to work with the abcart service as provided by abcart.io.

Currently this library is primarily being used as a lower level provider for the [abcart-react](https://github.com/abcloudio/abcart-react) library. That said, this library may be used directly.

For instructions on getting your api keys and creating signed JSON Web Tokens, see the documentation (for `abcart-react`) at [abcart.io](https://www.abcart.io/documentation/getting-your-api-key-and-shared-secret-key).

For documentation on the available `actions`, see [src/actions.js](src/actions.js) in this repository.

The following example shows direct initialization of this library.

```js
import abCloudCart from "abcart";

const { store, actions, connect } = abCloudCart({
    appId: APPLICATION_ID,
    apikey: ABCART_APIKEY,
    token: ABCART_JSON_WEB_TOKEN
});

// activate the store, later you may call subscription.unsubscribe() to clean up the store
const subscription = connect();

// once the store has been activated you can subscribe to state changes, the store is a "HOT" rxjs observable. You can subscribe and unsubscribe multiple times without losing the underlying connection.
const storeSubscription = store.subscribe({
    next: state => {
        console.log(state);
    }
});

// You can submit actions to the server by calling any of these actions with the given payload, see src/actions.js for function signatures
const {
    calculateShippingMethods,
    chooseShippingMethod,
    stripePayForOrder,
    stripeSubscription,
    updateAddress,
    updateCartItem,
    updatePaymentMethod
} = actions;

// example use
const sku = "sku_123"; // string
const quantity = 1; // integer
const metadata = { name: "Great Product" }; // object
updateCartItem(sku, quantity, metadata);
```
