// To support: system="spectrum-two" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/spectrum-two/scale-medium.js";
import "@spectrum-web-components/theme/spectrum-two/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
import React, { useState } from "react";
import "./App.css";

import { AddOnSDKAPI } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

const App = ({ addOnUISdk }: { addOnUISdk: AddOnSDKAPI }) => {
    const [buttonLabel, setButtonLabel] = useState("Click me");

    function handleClick() {
        setButtonLabel("Clicked");
    }

    return (
        // Please note that the below "<Theme>" component does not react to theme changes in Express.
        // You may use "addOnUISdk.app.ui.theme" to get the current theme and react accordingly.
        <Theme system="spectrum-two" scale="medium" color="light">
            <div className="container">
                <Button size="m" onClick={handleClick}>
                    {buttonLabel}
                </Button>
            </div>
        </Theme>
    );
};

export default App;
