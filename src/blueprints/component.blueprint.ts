
import * as path from 'path';

export const component = {
    files() {
        return [
            {
                path: path.join('<%= root %>', '<%= name %>', '<%= name %>.component.ts'),
                text: `
                    class <%= name %>Component {

                    }
                `
            }
        ];

    }

};