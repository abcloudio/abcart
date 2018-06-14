import { Observable } from "rxjs";
import mock from "xhr-mock";

describe("Pay for order", () => {
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

        mock.post("https://api.abcart.io/stripe-pay-for-order", (req, res) => {
            expect(JSON.parse(req.body())).toEqual({
                orderId: "or_1234",
                source: "token_123",
                isNewCard: true
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
        });

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
                    stripePayForOrder: { status: "requestInFlight" }
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
            initCart.actions.stripePayForOrder("or_1234", "token_123", true);
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

        mock.post("https://api.abcart.io/stripe-pay-for-order", (req, res) => {
            return res.status(500).body({
                message: "Bad Request"
            });
        });

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
                    stripePayForOrder: { status: "requestInFlight" }
                });
            }
            if (calls === 2) {
                expect(data).toEqual({
                    addresses: [],
                    stripePayForOrder: {
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
            initCart.actions.stripePayForOrder("or_1234", "token_123", true);
        }, 10);
    });
});
