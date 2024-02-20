/**
 * Copyright 2022 Dhiego Cassiano Fogaça Barbosa
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Router as RouterWrapper } from "midori/router";
import { Response } from "midori/http";

import * as Oauth2Handler from "@app/handler/Oauth2Handler.js";
import * as WebhookHandler from "@app/handler/WebhookHandler.js";
import * as AuthHandler from "@app/handler/AuthHandler.js";

import AuthBearerMiddleware from "@app/middleware/AuthBearerMiddleware.js";
import OauthScopeMiddlewareFactory from "@app/middleware/OauthScopeMiddleware.js";
import WebhookCreateValidationMiddleware from "@app/middleware/validations/WebhookCreateValidationMiddleware.js";
import WebhookUpdateValidationMiddleware from "@app/middleware/validations/WebhookUpdateValidationMiddleware.js";
import WebhookPatchValidationMiddleware from "@app/middleware/validations/WebhookPatchValidationMiddleware.js";

import { addSwaggerRoutes } from "midori-swaggerui";

const OauthScopeMiddlewareCallWebhook = OauthScopeMiddlewareFactory({ scopes: ['call'] });
const OauthScopeMiddlewareReadWebhook = OauthScopeMiddlewareFactory({ scopes: ['read:webhooks'] });
const OauthScopeMiddlewareWriteWebhook = OauthScopeMiddlewareFactory({ scopes: ['write:webhooks'] });
const OauthScopeMiddlewareDeleteWebhook = OauthScopeMiddlewareFactory({ scopes: ['delete:webhooks'] });

const Router = new RouterWrapper();

/**
 * Routing
 *
 * Define your routes here
 * Use the Router.get(), Router.post(), Router.put(), Router.patch(), Router.delete() methods to define your routes
 * Use the Router.group() method to group routes under a common prefix
 * Use the Router.route() method to define a route using a custom HTTP method
 */

addSwaggerRoutes(Router);
Router.get('/', async (req, res) => Response.redirect('/docs')).withName('home');

Router.get('/auth/user', AuthHandler.User, [AuthBearerMiddleware]).withName('auth.user');

Router.get('/jwks.json', Oauth2Handler.ListKeys).withName('oauth.jwk');
Router.post('/oauth/token', Oauth2Handler.Token).withName('oauth.token');

Router.group('/webhook', () => {
    Router.get('', WebhookHandler.List, [AuthBearerMiddleware, OauthScopeMiddlewareReadWebhook]).withName('webhook.list');
    Router.post('', WebhookHandler.Create, [AuthBearerMiddleware, OauthScopeMiddlewareWriteWebhook, WebhookCreateValidationMiddleware]).withName('webhook.create');

    Router.group('/{id}', () => {
        Router.get('', WebhookHandler.Show, [AuthBearerMiddleware, OauthScopeMiddlewareReadWebhook]).withName('webhook.show');
        Router.put('', WebhookHandler.Update, [AuthBearerMiddleware, OauthScopeMiddlewareWriteWebhook, WebhookUpdateValidationMiddleware]).withName('webhook.update');
        Router.patch('', WebhookHandler.Patch, [AuthBearerMiddleware, OauthScopeMiddlewareWriteWebhook, WebhookPatchValidationMiddleware]).withName('webhook.patch');
        Router.delete('', WebhookHandler.Destroy, [AuthBearerMiddleware, OauthScopeMiddlewareDeleteWebhook]).withName('webhook.destroy');

        Router.get('/call', WebhookHandler.Call, [AuthBearerMiddleware, OauthScopeMiddlewareCallWebhook]).withName('webhook.call');
    });
});

export default Router;
