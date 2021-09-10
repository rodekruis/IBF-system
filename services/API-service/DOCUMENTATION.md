# [IBF API Documentation](https://ibf.510.global/docs/)

### What is [IBF API Documentation](https://ibf.510.global/docs/)?

[IBF API Documentation](https://ibf.510.global/docs/) describes the IBF [REST API](https://www.smashingmagazine.com/2018/01/understanding-using-rest-api/) which allows programmatic controlled access to the IBF-database.

### What information is accessible via the IBF REST API?

Disaster forecast, indicator and early action information is available in JSON format.

### Can I access the IBF REST API?

You need to be authorized to access this information. You must request [510.global](https://www.510.global/) for authorization.

### How to update [IBF API Documentation](https://ibf.510.global/docs/)?

The [official NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction) is the source reference. The [NestJS Swagger module](https://github.com/nestjs/swagger) provides [decorators](https://docs.nestjs.com/openapi/decorators) to add to [controllers](https://docs.nestjs.com/controllers) and [entities](https://docs.nestjs.com/techniques/database#repository-pattern).

For example, [`/api/user`](https://ibf.510.global/docs/#/user/UserController_create) is defined in [`UserController`](https://github.com/rodekruis/IBF-system/blob/master/services/API-service/src/api/user/user.controller.ts#L33-L51).

On [line 35](https://github.com/rodekruis/IBF-system/blob/master/services/API-service/src/api/user/user.controller.ts#L35), [ApiOperation decorator](https://docs.nestjs.com/openapi/decorators) allows us to add a **description** using the `summary` parameter.

On [lines 36-40](https://github.com/rodekruis/IBF-system/blob/master/services/API-service/src/api/user/user.controller.ts#L36-L40), [ApiResponse decorator](https://docs.nestjs.com/openapi/decorators) allows us to describe what the [**response object**](https://github.com/rodekruis/IBF-system/blob/master/services/API-service/src/api/user/user.controller.ts#L39) would look like.

On [line 48](https://github.com/rodekruis/IBF-system/blob/master/services/API-service/src/api/user/user.controller.ts#L48) sets the [expected structure](https://github.com/rodekruis/IBF-system/blob/master/services/API-service/src/api/user/dto/create-user.dto.ts#L15) of the **request body**. [ApiProperty decorator](https://docs.nestjs.com/openapi/decorators) allows us to provides _example_ and _default_ values via the `example` and `default` parameters respectively.

If we make changes to any of the defined decorators and their parameters, we would see a corresponding visual change in the documentation page.

### Checklist

1. Does the API have a description?
2. Is the [security](https://docs.nestjs.com/openapi/security) level set appropriately?
3. Is the [schema](https://docs.nestjs.com/openapi/types-and-parameters) valid for the endpoint?
4. Are there examples for each parameter?
5. Is the [schema](https://docs.nestjs.com/openapi/types-and-parameters) defined for the request object?
6. Is the [schema](https://docs.nestjs.com/openapi/types-and-parameters) defined for the response object?
