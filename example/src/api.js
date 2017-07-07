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
                }, {
                        name:'span',
                        component:'Span',
                        children:"{{data.details[{0}]}}",
                        _power:'for in data.details'
                }]

        }
    
}