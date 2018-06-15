import { Observable } from "rxjs";
import mock from "xhr-mock";
jest.mock("uuid/v4", () => jest.fn(() => "mock-uuid"));

const address = {
    country: "US",
    city: "Anytown",
    phone: "812-2342-2343",
    name: "Jenny Rosen",
    state: "MA",
    postal_code: "123456",
    line2: "2nd Floor",
    line1: "1234 Main street"
};

describe("Calculate Shipping Methods", () => {
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
            "https://api.abcart.io/calculate-shipping-methods",
            (req, res) => {
                expect(JSON.parse(req.body())).toEqual({
                    city: "Anytown",
                    country: "US",
                    id: "1234",
                    isNewAddress: true,
                    isSelected: true,
                    line1: "1234 Main street",
                    line2: "2nd Floor",
                    name: "Jenny Rosen",
                    phone: "812-2342-2343",
                    postal_code: "123456",
                    state: "MA"
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
                    calculateShippingMethods: { status: "requestInFlight" }
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
            initCart.actions.calculateShippingMethods(
                "1234",
                address,
                true,
                true
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

        mock.post(
            "https://api.abcart.io/calculate-shipping-methods",
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
                    calculateShippingMethods: { status: "requestInFlight" }
                });
            }
            if (calls === 2) {
                expect(data).toEqual({
                    addresses: [],
                    calculateShippingMethods: {
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
            initCart.actions.calculateShippingMethods(
                "1234",
                address,
                true,
                true
            );
        }, 10);
    });
});
