import { Observable } from "rxjs";
import mock from "xhr-mock";

describe("Create a subscription", () => {
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

        mock.post("https://api.abcart.io/stripe-subscription", (req, res) => {
            expect(JSON.parse(req.body())).toEqual({
                items: [
                    {
                        plan: "plan_abc"
                    }
                ],
                source: "token_123"
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
                    stripeSubscription: { status: "requestInFlight" }
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
            initCart.actions.stripeSubscription(
                [
                    {
                        plan: "plan_abc"
                    }
                ],
                "token_123"
            );
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

        mock.post("https://api.abcart.io/stripe-subscription", (req, res) => {
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
                    stripeSubscription: { status: "requestInFlight" }
                });
            }
            if (calls === 2) {
                expect(data).toEqual({
                    addresses: [],
                    stripeSubscription: {
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
            initCart.actions.stripeSubscription(
                [
                    {
                        plan: "plan_abc"
                    }
                ],
                "token_123"
            );
        }, 10);
    });
});
