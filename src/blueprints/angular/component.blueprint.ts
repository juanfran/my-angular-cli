
import * as path from 'path';

export default {
    files() {
        return [
            {
                path: path.join('<%= root %>', '<%= name %>', '<%= name %>.component.ts'),
                text: `
                    class <%= utils.capitalize(name) %>Component {

                    }
                `
            }
        ];

    }

};