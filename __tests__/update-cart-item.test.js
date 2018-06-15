import { Observable } from "rxjs";
//import { jsdom } from "jsdom";
import mock from "xhr-mock";
jest.mock("uuid/v4", () => jest.fn(() => "mock-uuid"));

describe("Update Cart Item", () => {
    it(`Lifecyle of adding, removing, and updating the cart works
        - starts with two items in the cart that are fetched from the server
        - pending update the quantity of the first item
        - pending update the quantity of the second item (before the server has responded to the first)
        - server responds to the first item
        - server responds to the second item
        - we delete an item and pending quantity 0 is emitted
        - server responds with delete and item is removed
        - we add a new item and pending add is emitted
        - update comes back from server with new item`, done => {
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
                cart: [
                    {
                        quantity: 1,
                        sku: "4234",
                        metadata: {
                            price: 12.99,
                            name: "Great Product"
                        }
                    },
                    {
                        metadata: { name: "Awesome Thing One", price: 599.99 },
                        quantity: 3,
                        sku: "2141"
                    }
                ]
            });
        });

        var apiCalls = 0;
        const mockAjax = jest.fn(data => {
            apiCalls++;
            return apiCalls < 3
                ? Observable.of({
                      response: {
                          cart: [
                              {
                                  quantity: 5,
                                  sku: "4234",
                                  metadata: {
                                      price: 12.99,
                                      name: "Great Product"
                                  },
                                  // don't save this to the database on the server
                                  ...(apiCalls === 1
                                      ? { updateId: "mock-uuid" }
                                      : {})
                              },
                              {
                                  metadata: {
                                      name: "Awesome Thing One",
                                      price: 599.99
                                  },
                                  quantity: apiCalls === 2 ? 7 : 3,
                                  sku: "2141",
                                  ...(apiCalls === 2
                                      ? { updateId: "mock-uuid" }
                                      : {})
                              }
                          ]
                      }
                  })
                      // this will make the response async and change not interup the initial get api call
                      .delay(10)
                : apiCalls < 4
                    ? Observable.of({
                          response: {
                              cart: [
                                  {
                                      quantity: 5,
                                      sku: "4234",
                                      metadata: {
                                          price: 12.99,
                                          name: "Great Product"
                                      }
                                  }
                              ]
                          }
                      })
                          // this will make the response async and change not interup the initial get api call
                          .delay(100)
                    : Observable.of({
                          response: {
                              cart: [
                                  {
                                      quantity: 5,
                                      sku: "4234",
                                      metadata: {
                                          price: 12.99,
                                          name: "Great Product"
                                      }
                                  },
                                  {
                                      quantity: 1,
                                      metadata: {
                                          name: "Fantastic Thing Two",
                                          price: 89.99
                                      },
                                      sku: "2145",
                                      updateId: "mock-uuid"
                                  }
                              ]
                          }
                      })
                          // this will make the response async and change not interup the initial get api call
                          .delay(10);
        });
        Observable.ajax = mockAjax;
        Date.now = jest.fn(() => 1);

        // initialize sdk
        const sub = initCart.connect();

        var calls = 0;
        initCart.store.subscribe(data => {
            if (calls === 0) {
                expect(data).toEqual({
                    cart: [
                        {
                            metadata: { name: "Great Product", price: 12.99 },
                            quantity: 1,
                            sku: "4234"
                        },
                        {
                            metadata: {
                                name: "Awesome Thing One",
                                price: 599.99
                            },
                            quantity: 3,
                            sku: "2141"
                        }
                    ]
                });
            }

            if (calls === 1) {
                expect(data).toEqual({
                    cart: [
                        {
                            metadata: { name: "Great Product", price: 12.99 },
                            pending: {
                                metadata: {
                                    name: "Great Product",
                                    price: 12.99
                                },
                                quantity: 5,
                                sku: "4234",
                                updateId: "mock-uuid"
                            },
                            quantity: 1,
                            sku: "4234"
                        },
                        {
                            metadata: {
                                name: "Awesome Thing One",
                                price: 599.99
                            },
                            quantity: 3,
                            sku: "2141"
                        }
                    ]
                });
            }
            if (calls === 2) {
                expect(data).toEqual({
                    cart: [
                        {
                            quantity: 1,
                            sku: "4234",
                            metadata: {
                                price: 12.99,
                                name: "Great Product"
                            },
                            pending: {
                                updateId: "mock-uuid",
                                sku: "4234",
                                quantity: 5,
                                metadata: {
                                    price: 12.99,
                                    name: "Great Product"
                                }
                            }
                        },
                        {
                            metadata: {
                                name: "Awesome Thing One",
                                price: 599.99
                            },
                            quantity: 3,
                            sku: "2141",
                            pending: {
                                updateId: "mock-uuid",
                                sku: "2141",
                                quantity: 7,
                                metadata: {
                                    name: "Awesome Thing One",
                                    price: 599.99
                                }
                            }
                        }
                    ]
                });
            }
            if (calls === 3) {
                expect(data).toEqual({
                    cart: [
                        {
                            quantity: 5,
                            sku: "4234",
                            metadata: {
                                price: 12.99,
                                name: "Great Product"
                            }
                        },
                        {
                            metadata: {
                                name: "Awesome Thing One",
                                price: 599.99
                            },
                            quantity: 3,
                            sku: "2141",
                            pending: {
                                updateId: "mock-uuid",
                                sku: "2141",
                                quantity: 7,
                                metadata: {
                                    name: "Awesome Thing One",
                                    price: 599.99
                                }
                            }
                        }
                    ]
                });
            }
            if (calls === 4) {
                expect(data).toEqual({
                    cart: [
                        {
                            quantity: 5,
                            sku: "4234",
                            metadata: {
                                price: 12.99,
                                name: "Great Product"
                            }
                        },
                        {
                            metadata: {
                                name: "Awesome Thing One",
                                price: 599.99
                            },
                            quantity: 7,
                            sku: "2141"
                        }
                    ]
                });

                expect(mockAjax.mock.calls[1][0]).toEqual({
                    body: {
                        metadata: { name: "Awesome Thing One", price: 599.99 },
                        quantity: 7,
                        sku: "2141",
                        updateId: "mock-uuid"
                    },
                    headers: {
                        Authorization: "Bearer API_KEY_JWT",
                        "Content-Type": "application/json",
                        "x-api-key": "apiKey"
                    },
                    method: "POST",
                    responseType: "json",
                    url: "https://api.abcart.io/update-cart-item"
                });
            }
            if (calls === 5) {
                // pending delete applied
                expect(data).toEqual({
                    cart: [
                        {
                            quantity: 5,
                            sku: "4234",
                            metadata: {
                                price: 12.99,
                                name: "Great Product"
                            }
                        },
                        {
                            metadata: {
                                name: "Awesome Thing One",
                                price: 599.99
                            },
                            quantity: 7,
                            sku: "2141",
                            pending: {
                                updateId: "mock-uuid",
                                sku: "2141",
                                quantity: 0
                            }
                        }
                    ]
                });
            }
            if (calls === 6) {
                // item deleted
                expect(data).toEqual({
                    cart: [
                        {
                            quantity: 5,
                            sku: "4234",
                            metadata: {
                                price: 12.99,
                                name: "Great Product"
                            }
                        }
                    ]
                });
            }
            if (calls === 7) {
                expect(data).toEqual({
                    cart: [
                        {
                            quantity: 5,
                            sku: "4234",
                            metadata: {
                                price: 12.99,
                                name: "Great Product"
                            }
                        },
                        {
                            sku: "2145",
                            pending: {
                                updateId: "mock-uuid",
                                sku: "2145",
                                quantity: 1,
                                metadata: {
                                    name: "Fantastic Thing Two",
                                    price: 89.99
                                }
                            }
                        }
                    ]
                });
            }
            if (calls === 8) {
                expect(data).toEqual({
                    cart: [
                        {
                            quantity: 5,
                            sku: "4234",
                            metadata: {
                                price: 12.99,
                                name: "Great Product"
                            }
                        },
                        {
                            quantity: 1,
                            metadata: {
                                name: "Fantastic Thing Two",
                                price: 89.99
                            },
                            sku: "2145"
                        }
                    ]
                });
                sub.unsubscribe();
                mock.teardown();
                done();
            }
            calls++;
        });

        setTimeout(() => {
            initCart.actions.updateCartItem("4234", 5, {
                price: 12.99,
                name: "Great Product"
            });
            expect(mockAjax.mock.calls[0][0]).toEqual({
                body: {
                    metadata: { name: "Great Product", price: 12.99 },
                    quantity: 5,
                    sku: "4234",
                    updateId: "mock-uuid"
                },
                headers: {
                    Authorization: "Bearer API_KEY_JWT",
                    "Content-Type": "application/json",
                    "x-api-key": "apiKey"
                },
                method: "POST",
                responseType: "json",
                url: "https://api.abcart.io/update-cart-item"
            });
        }, 10);

        setTimeout(() => {
            initCart.actions.updateCartItem("2141", 7, {
                name: "Awesome Thing One",
                price: 599.99
            });
        }, 20);

        setTimeout(() => {
            initCart.actions.updateCartItem("2141", 0);
        }, 100);

        setTimeout(() => {
            initCart.actions.updateCartItem("2145", 1, {
                name: "Fantastic Thing Two",
                price: 89.99
            });
        }, 250);
    });
});
