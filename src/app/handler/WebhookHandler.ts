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

import { Prisma, Webhook } from "@prisma/client";

import { prisma } from "@core/lib/Prisma.js";

export class List extends Handler {
    #auth: Auth;

    constructor(app: Application) {
        super(app);

        this.#auth = app.services.get(AuthServiceProvider);
    }

    async handle(req: Request): Promise<Response> {
        // Since the AuthBearer middleware is used, the user is already authenticated
        const user = this.#auth.user(req)!;

        const data = await prisma.webhook.findMany({
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

    async handle(req: Request<{ url: string, method: string, headers?: Record<string, string>, body?: string; }>): Promise<Response> {
        if (!req.parsedBody) {
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
            method: req.parsedBody.method,
            url: req.parsedBody.url,
            headers: req.parsedBody.headers ?? undefined,
            body: req.parsedBody.body,
        };

        const saved = await prisma.webhook.create({ data });
        if (!saved) {
            throw new HTTPError("Failed to save webhook.", EStatusCode.INTERNAL_SERVER_ERROR);
        }

        return Response.json(saved).withStatus(EStatusCode.CREATED);
    }
}

export class Show extends Handler {
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

        const webhook = await prisma.webhook.findFirst({
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

        return Response.json(webhook);
    }
}

export class Update extends Handler {
    #auth: Auth;

    constructor(app: Application) {
        super(app);

        this.#auth = app.services.get(AuthServiceProvider);
    }

    async handle(req: Request<{ url: string, method: string, headers: Record<string, string> | null, body: string | null; }>): Promise<Response<Webhook>> {
        const id = req.params.get('id');
        if (!id) {
            throw new HTTPError("Invalid ID.", EStatusCode.BAD_REQUEST);
        }

        const webhook = await prisma.webhook.findFirst({
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

        webhook.url = req.parsedBody.url;
        webhook.method = req.parsedBody.method;
        webhook.headers = req.parsedBody.headers;
        webhook.body = req.parsedBody.body;

        await prisma.webhook.update({ where: { id }, data: { url: webhook.url, method: webhook.method, headers: webhook.headers ?? undefined, body: webhook.body } });

        return Response.json<Webhook>(webhook);
    }
}

export class Patch extends Handler {
    #auth: Auth;

    constructor(app: Application) {
        super(app);

        this.#auth = app.services.get(AuthServiceProvider);
    }

    async handle(req: Request<{ url?: string, method?: string, headers?: Record<string, string>, body?: string; }>): Promise<Response> {
        const id = req.params.get('id');
        if (!id) {
            throw new HTTPError("Invalid ID.", EStatusCode.BAD_REQUEST);
        }

        const webhook = await prisma.webhook.findFirst({
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

        if (req.parsedBody.url) {
            webhook.url = req.parsedBody.url;
        }

        if (req.parsedBody.headers) {
            webhook.headers = req.parsedBody.headers;
        }

        if (req.parsedBody.body) {
            webhook.body = req.parsedBody.body;
        }

        await prisma.webhook.update({ where: { id }, data: { method: webhook.method, url: webhook.url, headers: webhook.headers ?? undefined, body: webhook.body } });

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

        const webhook = await prisma.webhook.findFirst({
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

        await prisma.webhook.delete({ where: { id } });

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

        const webhook = await prisma.webhook.findFirst({
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
            const res = await fetch(webhook.url, {
                headers: webhook.headers as Record<string, string> ?? undefined,
                method: webhook.method,
                body: webhook.body,
            });

            const body = !res.body ? null : await res.text();

            const responseHeaders: Record<string, string> = {};
            for (const [key, value] of res.headers.entries()) {
                responseHeaders[key] = value;
            }

            await prisma.webhookLog.create({
                data: {
                    id: generateUUID(),
                    webhook: {
                        connect: {
                            id: webhook.id
                        }
                    },
                    status: res.status,
                    headers: responseHeaders,
                    body
                }
            });

            return Response.json({
                status: res.status,
                headers: responseHeaders,
                body,
            });
        } catch (e) {
            if (!(e instanceof Error)) {
                throw e;
            }

            throw new HTTPError(e.message, EStatusCode.INTERNAL_SERVER_ERROR);
        }
    }
}
