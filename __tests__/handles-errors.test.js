import { Observable } from "rxjs";
import mock from "xhr-mock";

jest.mock("uuid/v4", () => {
    var uuidCalls = 0;
    return jest.fn(() => {
        uuidCalls++;
        return "mock-uuid_" + uuidCalls;
    });
});

describe("Handles an error and shows message", () => {
    var zero, one, two, three, four;

    it("Sets up and runs test", done => {
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
                cart: []
            });
        });

        var apiCalls = 0;
        const mockAjax = jest.fn(data => {
            if (apiCalls === 0) {
                apiCalls++;
                return Observable.of(1)
                    .delay(10)
                    .flatMap(() =>
                        Observable.throw({
                            response: { message: "Bad Request" }
                        })
                    );
            }
            return (
                Observable.of({
                    response: {
                        cart: [data.body]
                    }
                })
                    // this will make the response async and change not interup the initial get api call
                    .delay(10)
            );
        });
        Observable.ajax = mockAjax;

        var calls = 0;
        initCart.store.subscribe(data => {
            switch (calls) {
                case 0:
                    zero = data;
                    break;
                case 1:
                    one = data;
                    break;
                case 2:
                    two = data;
                    break;
                case 3:
                    three = data;
                    break;
                case 4:
                    four = data;
                    sub.unsubscribe();
                    mock.teardown();
                    done();
                    break;
            }
            calls++;
        });

        // initialize sdk
        const sub = initCart.connect();

        setTimeout(() => {
            initCart.actions.updateCartItem("8843", 1, {
                price: 12.99,
                name: "Great Product"
            });
        }, 10);

        setTimeout(() => {
            initCart.actions.updateCartItem("8843", 1, {
                price: 12.99,
                name: "Great Product"
            });
        }, 150);
    });

    it("Gets empty cart from server", () => {
        expect(zero).toEqual({ cart: [] });
    });

    it("Adds item to the cart and gets pending update", () => {
        expect(one).toEqual({
            cart: [
                {
                    sku: "8843",
                    pending: {
                        updateId: "mock-uuid_1",
                        sku: "8843",
                        quantity: 1,
                        metadata: {
                            price: 12.99,
                            name: "Great Product"
                        }
                    }
                }
            ]
        });
    });

    it("Server has an error and pending is updated with error message", () => {
        expect(two).toEqual({
            cart: [
                {
                    pending: {
                        error: { message: "Bad Request" },
                        metadata: {
                            name: "Great Product",
                            price: 12.99
                        },
                        quantity: 1,
                        sku: "8843",
                        updateId: "mock-uuid_1"
                    },
                    sku: "8843"
                }
            ]
        });
    });

    it("Add item to the cart again update pending message (removing error)", () => {
        expect(three).toEqual({
            cart: [
                {
                    pending: {
                        metadata: {
                            name: "Great Product",
                            price: 12.99
                        },
                        quantity: 1,
                        sku: "8843",
                        updateId: "mock-uuid_2"
                    },
                    sku: "8843"
                }
            ]
        });
    });

    it("Item is finally added to cart and confirmed from server", () => {
        expect(four).toEqual({
            cart: [
                {
                    sku: "8843",
                    quantity: 1,
                    metadata: {
                        price: 12.99,
                        name: "Great Product"
                    }
                }
            ]
        });
    });
});
