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

import { EStatusCode, Handler, Request, Response } from "midori/http";
import { HTTPError } from "midori/errors";
import { generateUUID } from "midori/util/uuid.js";
import { Auth } from "midori/auth";
import { Application } from "midori/app";
import { AuthServiceProvider } from "midori/providers";

import { Prisma } from "@prisma/client";
import WebhookDAO from "@core/dao/WebhookDAO.js";

export class List extends Handler {
    #auth: Auth;

    constructor(app: Application) {
        super(app);

        this.#auth = app.services.get(AuthServiceProvider);
    }

    async handle(req: Request): Promise<Response> {
        // Since the AuthBearer middleware is used, the user is already authenticated
        const user = this.#auth.user(req)!;

        const data = await WebhookDAO.all({
            where: {
                user: {
                    id: user.id
                }
            }
        });

        return Response.json(data);
    }
}

export class Create extends Handler {
    #auth: Auth;

    constructor(app: Application) {
        super(app);

        this.#auth = app.services.get(AuthServiceProvider);
    }

    async handle(req: Request): Promise<Response> {
        if (!req.parsedBody || typeof req.parsedBody.callback !== 'string') {
            throw new HTTPError("Invalid body.", EStatusCode.BAD_REQUEST);
        }

        const id = generateUUID();

        // Since the AuthBearer middleware is used, the user is already authenticated
        const user = this.#auth.user(req)!;

        const data: Prisma.WebhookCreateInput = {
            id,
            user: {
                connect: { id: user.id },
            },
            method: req.parsedBody.method || 'GET',
            callback: req.parsedBody.callback,
            body: req.parsedBody.body,
        };

        const saved = await WebhookDAO.create(data);
        if (!saved) {
            throw new HTTPError("Failed to save webhook.", EStatusCode.INTERNAL_SERVER_ERROR);
        }

        return Response.json(saved).withStatus(EStatusCode.CREATED);
    }
}

export class Show extends Handler {
    async handle(req: Request): Promise<Response> {
        const id = req.params.get('id');
        if (!id) {
            throw new HTTPError("Invalid ID.", EStatusCode.BAD_REQUEST);
        }

        const webhook = await WebhookDAO.get({
            where: {
                id
            }
        });

        if (!webhook) {
            throw new HTTPError('Webhook not found.', EStatusCode.NOT_FOUND);
        }

        return Response.json(webhook);
    }
}

export class Update extends Handler {
    #auth: Auth;

    constructor(app: Application) {
        super(app);

        this.#auth = app.services.get(AuthServiceProvider);
    }

    async handle(req: Request): Promise<Response> {
        const id = req.params.get('id');
        if (!id) {
            throw new HTTPError("Invalid ID.", EStatusCode.BAD_REQUEST);
        }

        const webhook = await WebhookDAO.get({
            where: {
                id
            }
        });

        if (!webhook) {
            throw new HTTPError('Webhook not found.', EStatusCode.NOT_FOUND);
        }

        // Since the AuthBearer middleware is used, the user is already authenticated
        const user = this.#auth.user(req)!;

        if (webhook.userId !== user.id) {
            throw new HTTPError('You are not the owner of this webhook.', EStatusCode.FORBIDDEN);
        }

        if (!req.parsedBody || typeof req.parsedBody.method !== 'string' || typeof req.parsedBody.callback !== 'string') {
            throw new HTTPError("Invalid body.", EStatusCode.BAD_REQUEST);
        }

        webhook.callback = req.parsedBody.callback;

        if (req.parsedBody.method) {
            webhook.method = req.parsedBody.method;
        }

        if (req.parsedBody.body) {
            webhook.body = req.parsedBody.body;
        }

        await WebhookDAO.save(webhook.id, { callback: webhook.callback! });

        return Response.json(webhook);
    }
}

export class Patch extends Handler {
    #auth: Auth;

    constructor(app: Application) {
        super(app);

        this.#auth = app.services.get(AuthServiceProvider);
    }

    async handle(req: Request): Promise<Response> {
        const id = req.params.get('id');
        if (!id) {
            throw new HTTPError("Invalid ID.", EStatusCode.BAD_REQUEST);
        }

        const webhook = await WebhookDAO.get({
            where: {
                id
            }
        });

        if (!webhook) {
            throw new HTTPError('Webhook not found.', EStatusCode.NOT_FOUND);
        }

        // Since the AuthBearer middleware is used, the user is already authenticated
        const user = this.#auth.user(req)!;

        if (webhook.userId !== user.id) {
            throw new HTTPError('You are not the owner of this webhook.', EStatusCode.FORBIDDEN);
        }

        if (!req.parsedBody) {
            throw new HTTPError("Invalid body.", EStatusCode.BAD_REQUEST);
        }

        if (req.parsedBody.method) {
            webhook.method = req.parsedBody.method;
        }

        if (req.parsedBody.callback) {
            webhook.callback = req.parsedBody.callback;
        }

        if (req.parsedBody.body) {
            webhook.body = req.parsedBody.body;
        }

        await WebhookDAO.save(webhook.id, { method: webhook.method, callback: webhook.callback, body: webhook.body });

        return Response.json(webhook);
    }
}

export class Destroy extends Handler {
    #auth: Auth;

    constructor(app: Application) {
        super(app);

        this.#auth = app.services.get(AuthServiceProvider);
    }

    async handle(req: Request): Promise<Response> {
        const id = req.params.get('id');
        if (!id) {
            throw new HTTPError("Invalid ID.", EStatusCode.BAD_REQUEST);
        }

        const webhook = await WebhookDAO.get({
            where: {
                id
            }
        });

        if (!webhook) {
            throw new HTTPError('Webhook not found.', EStatusCode.NOT_FOUND);
        }

        // Since the AuthBearer middleware is used, the user is already authenticated
        const user = this.#auth.user(req)!;

        if (webhook.userId !== user.id) {
            throw new HTTPError('You are not the owner of this webhook.', EStatusCode.FORBIDDEN);
        }

        await WebhookDAO.delete(webhook.id);

        return Response.empty();
    }
}

export class Call extends Handler {
    #auth: Auth;

    constructor(app: Application) {
        super(app);

        this.#auth = app.services.get(AuthServiceProvider);
    }

    async handle(req: Request): Promise<Response> {
        const id = req.params.get('id');
        if (!id) {
            throw new HTTPError("Invalid ID.", EStatusCode.BAD_REQUEST);
        }

        const webhook = await WebhookDAO.get({
            where: {
                id
            }
        });

        if (!webhook) {
            throw new HTTPError('Webhook not found.', EStatusCode.NOT_FOUND);
        }

        // Since the AuthBearer middleware is used, the user is already authenticated
        const user = this.#auth.user(req)!;

        if (webhook.userId !== user.id) {
            throw new HTTPError('You are not the owner of this webhook.', EStatusCode.FORBIDDEN);
        }

        try {
            const res = await fetch(webhook.callback, {
                method: webhook.method,
                body: webhook.body,
            });

            if (!res.body) {
                return Response.status(res.status);
            }

            const body = await res.text();

            const responseHeaders: Record<string, string> = {};
            for (const [key, value] of res.headers.entries()) {
                responseHeaders[key] = value;
            }

            return Response.send(Buffer.from(body));
        } catch (e) {
            if (!(e instanceof Error)) {
                throw e;
            }

            throw new HTTPError(e.message, EStatusCode.INTERNAL_SERVER_ERROR);
        }
    }
}
