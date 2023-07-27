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

import { Application } from "midori/app";
import { HTTPError } from "midori/errors";
import { Hash } from "midori/hash";
import { EStatusCode, Handler, Request, Response } from "midori/http";
import { generateUUID } from "midori/util/uuid.js";

import UserDAO from "@core/dao/UserDAO.js";
import { Auth } from "midori/auth";
import { AuthServiceProvider, HashServiceProvider } from "midori/providers";

export class Register extends Handler {
    #hash: Hash;

    constructor(app: Application) {
        super(app);

        this.#hash = app.services.get(HashServiceProvider);
    }

    async handle(req: Request): Promise<Response> {
        if (!req.parsedBody.username || !req.parsedBody.password) {
            throw new HTTPError("Invalid request.", EStatusCode.BAD_REQUEST);
        }

        const user = await UserDAO.get({
            where: {
                username: req.parsedBody.username
            }
        });

        if (user) {
            throw new HTTPError("Username already taken.", EStatusCode.BAD_REQUEST);
        }

        const password = this.#hash.hash(req.parsedBody.password);

        await UserDAO.create({
            id: generateUUID(),
            username: req.parsedBody.username,
            password,
        });

        return Response.status(EStatusCode.CREATED);
    }
}

export class User extends Handler {
    #auth: Auth;

    constructor(app: Application) {
        super(app);

        this.#auth = app.services.get(AuthServiceProvider);
    }

    async handle(req: Request): Promise<Response> {
        // Since the AuthBearer middleware is used, the user is already authenticated
        const authUser = this.#auth.user(req)!;

        const user = (await UserDAO.get({ select: { id: true, username: true }, where: { id: authUser.id } }))!;

        return Response.json(user);
    }
}
