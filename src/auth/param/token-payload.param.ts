import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { REQUEST_TOKEN_PAYLOAD_NAME } from "../common/auth.constant";
import { Request } from "express";

export const TokenPayloadParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const context = ctx.switchToHttp();
    const request: Request = context.getRequest();
    return request[REQUEST_TOKEN_PAYLOAD_NAME];
  }
);