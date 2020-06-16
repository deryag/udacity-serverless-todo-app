import { APIGatewayProxyEvent } from "aws-lambda";
import { verify, decode } from 'jsonwebtoken';
import * as jwksClient from "jwks-rsa";
import { config } from '../common';
import { JwtPayload } from "../auth/JwtPayload";
import { Jwt } from "../auth/Jwt";

const client = jwksClient({ jwksUri: config.auth0JWKSUrl });

export class AuthHelper {

    static getUserId(jwtToken: string): string;
    static getUserId(event: APIGatewayProxyEvent): string;
    static getUserId(param: string | APIGatewayProxyEvent): string {
        const token = this.getJWTToken(param);
        return this.parseUserId(token);
    }

    static getJWTToken(header: string): string;
    static getJWTToken(event: APIGatewayProxyEvent): string;
    static getJWTToken(param: string | APIGatewayProxyEvent): string;
    static getJWTToken(param: string | APIGatewayProxyEvent): string {
        if (!param)
            throw new Error("No authorization header provided to parse a JWT token");

        if (typeof param === "string") {
            return this.parseJWTToken(param);
        }
        else {
            const authHeader = param.headers.Authorization;
            if (!authHeader)
                throw new Error("No authorization header provided to parse a JWT token");

            return this.parseJWTToken(authHeader);
        }
    }

    static verifyToken(token: string, secretOrPublicKey: string): JwtPayload {
        if (!token)
            throw new Error("No token provided to verify");

        if (!secretOrPublicKey)
            throw new Error("No secretOrPublicKey provided to verify a token");

        return verify(
            token,
            secretOrPublicKey,
            { algorithms: ['RS256'] }
        ) as JwtPayload;
    }

    static decodeJWTToken(token: string): Jwt {
        if (!token)
            throw new Error("No JWT token provided to decode");

        return decode(token, {
            complete: true
        }) as Jwt;
    }

    static getSigningKey(jwt: Jwt): Promise<jwksClient.SigningKey> {
        return new Promise((resolve, reject) => {
            if (!jwt || !jwt.header) {
                return reject("No JWT token provided to get signing key");
            }
            const kid = 'AbXgohSsfItTfr5CTUYNn';
            client.getSigningKey(kid, (err: Error, key: jwksClient.SigningKey) => {
                if (err) {
                    //throw new Error('kid '+kid+' key:'+key);
                    return reject(err);
                }

                resolve(key);
            });
        });
    }

    private static parseJWTToken(header: string): string {
        if (!header.toLowerCase().startsWith('bearer '))
            throw new Error('Invalid authorization header : header.toLowerCase()');

        const split = header.split(' ');

        if (split.length !== 2) {
            throw new Error("Invalid authorization header ::"+ header.toLowerCase() + ' length: '+ split.length);
        }
        return split[1];
    }

    private static parseUserId(token: string): string {
        return this.decodeJWTToken(token).payload.sub;
    }
};