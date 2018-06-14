import * as ActionTypes from "./action-types";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/dom/ajax";
import "rxjs/add/operator/takeUntil";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/observable/merge";
import "rxjs/add/operator/scan";
import "rxjs/add/operator/finally";
import "rxjs/add/operator/publishReplay";
import "rxjs/add/operator/map";
import "rxjs/add/operator/do";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/concatMap";
import "rxjs/add/operator/share";
import "rxjs/add/operator/retry";
import "rxjs/add/observable/of";

import reducer from "./reducer";

// need to pass this in during the build step as an env variable, and when
// publishing to npm
const CART_API_URL = "https://api.abcart.io";

export default ({ appId, apikey, token }) => {
    // create subject to stream actions to the server
    const actions$ = new Subject();

    const actionResponses$ = actions$
        // using concatMap here will require each inner observable to complete before
        // triggering the next item. In this way we assure that we only have one inflight request at any
        // given time. flatMap, for example, would not give this behavior but would execute all in parallel
        // concatMap(): Projects each source value to an Observable which is merged in the output Observable,
        // in a serialized fashion waiting for each one to complete before merging the next — Official RxJS Docs
        // https://blog.angularindepth.com/practical-rxjs-in-the-wild-requests-with-concatmap-vs-mergemap-vs-forkjoin-11e5b2efe293
        .concatMap(action => {
            // unless here is where we want to apply the update pending thing, then we can only have
            // one inflight pending at a time in the store and if someone bangs on it they will not get the pending
            // until the other arrives back?
            return (
                Observable.ajax({
                    method: "POST", // action.method
                    url: `${CART_API_URL}/${action.type}`,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        "x-api-key": apikey
                    },
                    body: action.payload,
                    responseType: "json"
                })
                    .timeout(15000)
                    .map(({ response }) => ({
                        type: ActionTypes.NEXT_STATE,
                        payload: response,
                        inflightId: action.id
                    }))
                    // maybe retry is not working with my mock and i should mock the network instead of ajax
                    .retry(2)

                    // test for retry error, fail on first and succeed on second
                    .catch(e => {
                        return Observable.of({
                            type: ActionTypes.ERROR,
                            payload: {
                                action,
                                message: e.response
                            }
                        });
                    })
            );
        })
        //.do(console.log)
        .share(); // we share so the takeUntil does not create a duplicate subscription

    // try multiple URL is one fails
    // var source = Rx.Observable.catch(
    //     get("url1"),
    //     get("url2"),
    //     get("url3"),
    //     getCachedVersion()
    // );

    // get the cart when first connecting
    // will need to also get the user data, so actually maybe this is
    // just a full get state and we send from server whatever is needed
    const kickOfCart$ = Observable.ajax({
        url: `${CART_API_URL}/cart`,
        headers: {
            Authorization: `Bearer ${token}`,
            "x-api-key": apikey
        },
        crossDomain: true,
        createXHR: () => new XMLHttpRequest()
    }).map(({ response }) => ({
        type: ActionTypes.NEXT_STATE,
        payload: response
    }));

    // create a store from server events
    const store = Observable.merge(
        // takeUntil will prevent the api call from the server beating out
        // another call that actually updates the cart to a newer state
        kickOfCart$.takeUntil(actionResponses$),
        // our responses from the server
        actionResponses$,
        // set the pending requests
        actions$.map(({ type, payload }) => ({
            type: ActionTypes.PENDING_REQUEST,
            payload: {
                type,
                payload
            }
        }))
    )
        .scan(reducer, {
            cart: [],
            addresses: [],
            paymentMethods: [],
            orders: [],
            subscriptions: []
        })
        // will fire when unsubscribing after calling .connect()
        .finally(() => {
            actions$.complete();
        })
        .publishReplay(1); // https://blog.angularindepth.com/rxjs-understanding-the-publish-and-share-operators-16ea2f446635

    // create a dispatcher to send events to the server
    const dispatch = func => (...args) => actions$.next(func(...args));

    return {
        store,
        dispatch
    };
};
