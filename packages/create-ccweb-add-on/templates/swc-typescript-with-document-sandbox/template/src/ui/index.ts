import { LitElement, TemplateResult, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { until } from "lit/directives/until.js";
import "./components/App";

import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

@customElement("add-on-root")
export class Root extends LitElement {
    @state()
    private _isAddOnUISdkReady = addOnUISdk.ready;

    render(): TemplateResult {
        return html`
            ${until(
                this._isAddOnUISdkReady.then(async () => {
                    console.log("addOnUISdk is ready for use.");
                    return html`<add-on-app .addOnUISdk=${addOnUISdk}></add-on-app>`;
                })
            )}
        `;
    }
}
