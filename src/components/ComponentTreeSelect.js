import React from 'react'
import DropdownTreeSelect from 'react-dropdown-tree-select'
import 'react-dropdown-tree-select/dist/styles.css'


const ComponentTreeSelect = (props) => {
	
	const onChange = (currentNode, selectedNodes) => {
		props.setSelectedComponenents(selectedNodes)
		console.log(selectedNodes)
	}
	
	return (
		<DropdownTreeSelect data={props.componentTree} onChange={onChange} mode={"hierarchical"} keepTreeOnSearch showDropdown='initial' />
	)
}
export default ComponentTreeSelect;