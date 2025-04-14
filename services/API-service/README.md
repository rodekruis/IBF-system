# IBF-API-service: REST API of the IBF-system

The [IBF API](https://ibf.510.global/docs) is the REST API of the IBF-system, which allows the IBF pipelines (a.o.) to write data to the database and the [IBF dashboard](https://ibf.510.global) (a.o.) to read data from the database.

## Getting Started

- See [main README](https://github.com/rodekruis/IBF-system/blob/master/README.md)
- Access Swagger API via `http://localhost:3000/docs`

## Frameworks

- [NestJS](https://docs.nestjs.com/) This is a framework for building Node.js server-side applications. We use [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction) for documentation.

## Authentication

This applications uses [JSON Web Token](https://jwt.io/) (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and authentication of the token.
