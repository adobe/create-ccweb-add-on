import addOnScriptSdk from "AddOnScriptSdk";
import { editor, utils } from "express";

// Get the Script runtime.
const { runtime } = addOnScriptSdk.instance;

function start() {
    // APIs to be exposed to the UI runtime
    // i.e., to the `index.html` file of this add-on.
    const scriptApi = {
        createRectangle: () => {
            const rectangle = editor.createRectangle();

            // Define rectangle dimensions.
            rectangle.width = 480;
            rectangle.height = 360;

            // Define rectangle position.
            rectangle.translateX = 100;
            rectangle.translateY = 100;

            // Define rectangle color.
            const [red, green, blue, alpha] = [0.32, 0.34, 0.89, 1];

            // Fill the rectangle with the color.
            const rectangleFill = editor.createColorFill(utils.createColor(red, green, blue, alpha));
            rectangle.fills.append(rectangleFill);

            // Add the rectangle to the document.
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
        }
    };

    // Expose the APIs to the UI runtime.
    runtime.exposeApi(scriptApi);
}

start();
