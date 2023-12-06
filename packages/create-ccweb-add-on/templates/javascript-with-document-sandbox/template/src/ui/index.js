import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

addOnUISdk.ready.then(async () => {
    console.log("addOnUISdk is ready for use.");

    // Get the UI runtime.
    const { runtime } = addOnUISdk.instance;

    // Get the proxy object, which is required
    // to call the APIs defined in the Document Sandbox runtime
    // i.e., in the `code.js` file of this add-on.
    const sandboxProxy = await runtime.apiProxy("documentSandbox");

    const createRectangleButton = document.getElementById("createRectangle");
    createRectangleButton.addEventListener("click", async event => {
        await sandboxProxy.createRectangle();
    });

    // Enable the button only when:
    // 1. `addOnUISdk` is ready,
    // 2. `sandboxProxy` is available, and
    // 3. `click` event listener is registered.
    createRectangleButton.disabled = false;
});
