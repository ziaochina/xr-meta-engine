export function getMeta() {

        return {
                name: 'root',
                component: 'Div',
                children: [{
                        name: 'Input',
                        component: 'Input',
                        title3: 'bbb',
                        title4: '$$aaa',
                        value: '##form.col'
                }, "ssss", {
                        name: 'button',
                        component: 'Button',
                        children: 'fewfewfewfewfew'
                }]

        }
        return {
                name: 'root',
                component: 'Div',
                children: [{
                        name: 'Input',
                        title3: 'bbb',
                        title4: 'bbb',
                        component: 'Input',
                        bindField: 'form.col'
                }, "ssss", {
                        name: 'button',
                        component: 'Button',
                        children: 'fewfewfewfewfew'
                }]

        }
}