// DO NOT modify this file.

declare module "AddOnScriptSdk" {
    import { AddOnScriptSdkTypes } from "@adobe/ccweb-add-on-sdk-types";
    export default AddOnScriptSdkTypes.default;
    export * from "@adobe/ccweb-add-on-sdk-types/script/script-sdk";
}

declare module "express" {
    export * from "@adobe/ccweb-add-on-sdk-types/script/express";
}
