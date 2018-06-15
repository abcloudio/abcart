import { Observable } from "rxjs";
import mock from "xhr-mock";

describe("Get Initial Cart", () => {
    it("Gets saved cart from the server", done => {
        const cart = require("../src");

        const initCart = cart({
            appId: "test-app",
            userId: "1234",
            apikey: "apiKey",
            token: "API_KEY_JWT"
        });

        mock.setup();

        mock.get("https://api.abcart.io/cart", (req, res) => {
            expect({ ...req.headers(), ...req.url() }).toEqual({
                authorization: "Bearer API_KEY_JWT",
                host: "api.abcart.io",
                path: "/cart",
                protocol: "https",
                query: {},
                "x-api-key": "apiKey"
            });
            return res.status(200).body({
                cart: [
                    {
                        meta: { name: "Great Product", price: 15.99 },
                        quantity: 1,
                        sku: "4234"
                    }
                ]
            });
        });

        // initialize sdk
        const sub = initCart.connect();

        var calls = 0;
        initCart.store.subscribe(data => {
            if (calls === 0) {
                expect(data).toEqual({
                    cart: [
                        {
                            meta: { name: "Great Product", price: 15.99 },
                            quantity: 1,
                            sku: "4234"
                        }
                    ]
                });
                sub.unsubscribe();
                mock.teardown();
                done();
            }
            calls++;
        });
    });
});
