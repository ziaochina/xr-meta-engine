class componentFactory {
    constructor() {
        this.components = {}
        this.appComponents = {}
    }

    registerComponent(name, component) {
        if (this.components[name]) {
            throw `组件existed. name: ${name}`
        }
        this.components[name] = component
    }

    registerAppComponent(appName, componentName, component) {
        this.appComponents[appName] = this.appComponents[appName] || {}
        this.appComponents[appName].components = this.appComponents[appName].components || {}
        if (this.appComponents[appName].components[componentName])
            throw `组件existed. app:${appName}, name: ${componentName}`
        this.appComponents[appName].components[componentName] = component
    }

    registerComponents(components) {
        if (!components || components.length == 0)
            return
        components.forEach(c => this.registerComponent(c.name, c.component))
    }

    getComponent(appName, name) {
        if(!name)
            throw 'component name can not null'

        const nameSegs = name.split('.'),
            firstSeg = nameSegs[0]

        if (this.appComponents && this.appComponents[appName] && this.appComponents[appName].components && this.appComponents[appName].components[firstSeg]){
            var com = this.appComponents[appName].components[name]

            if(nameSegs.length > 1){
                com = findChild(com, nameSegs)
            }
            
            if(com) return com
            
        }

        var component = this.components[name]

        if(nameSegs.length > 1){
            component = findChild(component, nameSegs)
        }

        if (!component) {
            throw `没有组件. name: ${name}`
        }

        return component
    }

    findChild(component, nameSegs){
        for(let s of nameSegs.slice(1)){
            if(!component[s]){
                component = undefined
                return 
            }

            component = component[s]
        }
        return component

    }


}

const instance = new componentFactory()

export default instance