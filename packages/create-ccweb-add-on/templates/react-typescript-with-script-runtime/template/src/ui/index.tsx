import React from "react";
import { createRoot } from "react-dom/client";
import { ScriptApi } from "../models/ScriptApi";
import App from "./components/App";

import addOnUISdk, { RuntimeType } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

addOnUISdk.ready.then(async () => {
    console.log("addOnUISdk is ready for use.");

    // Get the UI runtime.
    const { runtime } = addOnUISdk.instance;

    // Get the proxy object, which is required
    // to call the APIs defined in the Script runtime
    // i.e., in the `code.js` file of this add-on.
    const scriptApi = (await runtime.apiProxy(RuntimeType.script)) as ScriptApi;

    const root = createRoot(document.getElementById("root"));
    root.render(<App addOnUISdk={addOnUISdk} scriptApi={scriptApi} />);
});
