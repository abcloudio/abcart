import { Observable } from "rxjs";
import mock from "xhr-mock";

describe("Choose Shipping Method", () => {
    it(`Makes proper api call to the server`, done => {
        const cart = require("../src");

        const initCart = cart({
            appId: "test-app",
            userId: "1234",
            apikey: "apiKey",
            token: "API_KEY_JWT"
        });

        mock.setup();

        mock.get("https://api.abcart.io/cart", (req, res) => {
            return res.status(200).body({
                cart: [],
                addresses: [],
                paymentMethods: [],
                orders: [],
                subscriptions: []
            });
        });

        mock.post(
            "https://api.abcart.io/choose-shipping-method",
            (req, res) => {
                expect(JSON.parse(req.body())).toEqual({
                    selectedShippingMethod: "shipping_1234",
                    orderId: "or_1234"
                });
                expect(req.headers()).toEqual({
                    authorization: "Bearer API_KEY_JWT",
                    "content-type": "application/json",
                    "x-api-key": "apiKey",
                    "x-requested-with": "XMLHttpRequest"
                });
                return res.status(200).body({
                    cart: [],
                    addresses: [],
                    paymentMethods: [],
                    orders: [{}],
                    subscriptions: []
                });
            }
        );

        // initialize sdk
        const sub = initCart.connect();

        var calls = 0;
        initCart.store.subscribe(data => {
            if (calls === 0) {
                expect(data).toEqual({
                    cart: [],
                    addresses: [],
                    paymentMethods: [],
                    orders: [],
                    subscriptions: []
                });
            }
            if (calls === 1) {
                expect(data).toEqual({
                    cart: [],
                    addresses: [],
                    paymentMethods: [],
                    orders: [],
                    subscriptions: [],
                    chooseShippingMethod: { status: "requestInFlight" }
                });
            }
            if (calls === 2) {
                expect(data).toEqual({
                    cart: [],
                    addresses: [],
                    paymentMethods: [],
                    orders: [{}],
                    subscriptions: []
                });
                sub.unsubscribe();
                mock.teardown();
                done();
            }
            calls++;
        });

        setTimeout(() => {
            initCart.actions.chooseShippingMethod("shipping_1234", "or_1234");
        }, 10);
    });

    it(`Properly handles an error from the server`, done => {
        const cart = require("../src");

        const initCart = cart({
            appId: "test-app",
            userId: "abc",
            apikey: "apiKey",
            token: "API_KEY_JWT"
        });

        mock.setup();

        mock.get("https://api.abcart.io/cart", (req, res) => {
            return res.status(200).body({
                cart: [],
                addresses: [],
                paymentMethods: [],
                orders: [],
                subscriptions: []
            });
        });

        mock.post(
            "https://api.abcart.io/choose-shipping-method",
            (req, res) => {
                return res.status(500).body({
                    message: "Bad Request"
                });
            }
        );

        // initialize sdk
        const sub = initCart.connect();

        var calls = 0;
        initCart.store.subscribe(data => {
            if (calls === 0) {
                expect(data).toEqual({
                    cart: [],
                    addresses: [],
                    paymentMethods: [],
                    orders: [],
                    subscriptions: []
                });
            }
            if (calls === 1) {
                expect(data).toEqual({
                    cart: [],
                    addresses: [],
                    paymentMethods: [],
                    orders: [],
                    subscriptions: [],
                    chooseShippingMethod: { status: "requestInFlight" }
                });
            }
            if (calls === 2) {
                expect(data).toEqual({
                    addresses: [],
                    chooseShippingMethod: {
                        error: { message: "Bad Request" },
                        status: "error"
                    },
                    cart: [],
                    orders: [],
                    paymentMethods: [],
                    subscriptions: []
                });
                sub.unsubscribe();
                mock.teardown();
                done();
            }
            calls++;
        });

        setTimeout(() => {
            initCart.actions.chooseShippingMethod("shipping_1234", "or_1234");
        }, 10);
    });
});
