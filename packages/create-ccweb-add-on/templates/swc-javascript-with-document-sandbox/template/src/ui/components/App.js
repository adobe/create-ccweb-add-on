// To support: theme="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";
import "@spectrum-web-components/theme/scale-medium.js";
import "@spectrum-web-components/theme/theme-light.js";

// To learn more about using "spectrum web components" visit:
// https://opensource.adobe.com/spectrum-web-components/
import "@spectrum-web-components/button/sp-button.js";
import "@spectrum-web-components/theme/sp-theme.js";

import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { style } from "./App.css";

import { RuntimeType } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

@customElement("add-on-app")
export class App extends LitElement {
    @property({ type: Object })
    addOnUISdk;

    @state()
    _sandboxProxy;

    static get styles() {
        return style;
    }

    async firstUpdated() {
        // Get the UI runtime.
        const { runtime } = this.addOnUISdk.instance;

        // Get the proxy object, which is required
        // to call the APIs defined in the Document Sandbox runtime
        // i.e., in the `code.ts` file of this add-on.
        this._sandboxProxy = await runtime.apiProxy(RuntimeType.documentSandbox);
    }

    _handleClick() {
        this._sandboxProxy.createRectangle();
    }

    render() {
        // Please note that the below "<sp-theme>" component does not react to theme changes in Express.
        // You may use "this.addOnUISdk.app.ui.theme" to get the current theme and react accordingly.
        return html` <sp-theme theme="express" color="light" scale="medium">
            <div class="container">
                <sp-button size="m" @click=${this._handleClick}>Create Rectangle</sp-button>
            </div>
        </sp-theme>`;
    }
}
