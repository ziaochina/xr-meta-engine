import React from 'react'

export function Div(props){
	return <div {...props} /> 
}

export function Input(props){
	const handleChange = (e)=>{
		props.onEvent('onFieldChange',{path:props.path, value:e.target.value })
	}
	return <input {...props} onChange={handleChange} />
}



export function Button(props){
	return <button {...props} /> 
}