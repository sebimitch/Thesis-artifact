import { Grid, Button, TextField, InputAdornment } from "@mui/material";
import { convertComponentsToComponentTreeFormat, getAllProjectComponents, getAllIssues } from "./components/DataFetching";
import React, { useState, useMemo } from 'react'
import ComponentTreeSelect from "./components/ComponentTreeSelect";
import { calculateProjectScore, compareComponentsAndGiveScore } from "./components/ScoreCalculation";
import DataTable from "./components/DataTable";
import ProjectViewTable from "./components/ProjectViewTable";
import { Box } from "@mui/system";

function App() {
	const defaultProjectID = ""

	const [componentTree, setComponentTree] = useState([])
	const [selectedComponenents, setSelectedComponenents] = useState([])
	const [projectTableRows, setProjectTableRows] = useState([])
	const [tableRows, setTableRows] = useState([])
	const [projectID, setProjectID] = useState(defaultProjectID)

	async function f() {
		let ct = []
		await getAllProjectComponents(1, ct, projectID)
		const result = convertComponentsToComponentTreeFormat(ct)
		setComponentTree(result) //this is async
		setSelectedComponenents(result)
		console.log(result)

		const issuesList = []
		await getAllIssues(1, issuesList, projectID)
		const components = {} // Object = componentName: list of issues inside component
		console.log(issuesList)

		// Add all issues within each component to the components object
		result.forEach(component => {
			const pathToComponent = component.path
			console.log(pathToComponent)
			components[pathToComponent] = []

			issuesList.forEach(issue => {
				const pathToFileContainingIssue = (issue.component).split(":")[1]
				if (pathToFileContainingIssue.startsWith(pathToComponent)) {
					components[pathToComponent].push(issue)
				}
			})
		})
		console.log(result)
		const rows = calculateProjectScore(compareComponentsAndGiveScore(components), projectID)
		setProjectTableRows(rows)
	}

	const addAllIssuesToObject = async () => {
		const issuesList = []
		await getAllIssues(1, issuesList, projectID)
		const components = {} // componentName: list of issues inside component

		// Add all issues within each component to the components object
		selectedComponenents.forEach(component => {
			const pathToComponent = component.path
			console.log(pathToComponent)
			components[pathToComponent] = []

			issuesList.forEach(issue => {
				const pathToFileContainingIssue = (issue.component).split(":")[1]
				if (pathToFileContainingIssue.startsWith(pathToComponent)) {
					components[pathToComponent].push(issue)
				}
			})
		})
		return components
	}

	const handleClick = async () => {
		if (selectedComponenents.length == 0) {
			return
		}

		const issuesList = []
		await getAllIssues(1, issuesList, projectID)
		const components = {} // componentName: list of issues inside component

		// Add all issues within each component to the components object
		selectedComponenents.forEach(component => {
			const pathToComponent = component.path
			console.log(pathToComponent)
			components[pathToComponent] = []

			issuesList.forEach(issue => {
				const pathToFileContainingIssue = (issue.component).split(":")[1]
				if (pathToFileContainingIssue.startsWith(pathToComponent)) {
					components[pathToComponent].push(issue)
				}
			})
		})

		setTableRows(compareComponentsAndGiveScore(components))
	}

	const handleClickUpdateProjectID = () => {
		setSelectedComponenents([])
		setTableRows([])
		setProjectTableRows([])
		setComponentTree([])
		f()
	}

	// useMemo to avoid rerendering component everytime an item is selected and setSelectedComponenents is called,
	// which makes the component not function properly
	const componentTreeSelect = useMemo(() => <ComponentTreeSelect componentTree={componentTree} setSelectedComponenents={setSelectedComponenents} />, [componentTree])

	return (
		<div>
			<Grid container rowGap={4} spacing={2}>
				<Grid item>
					<TextField variant="outlined" size="small" defaultValue={defaultProjectID}
						onChange={(e) => { setProjectID(e.target.value) }}
						InputProps={{ startAdornment: <InputAdornment position="start">id=</InputAdornment> }}
					/>
				</Grid>
				<Grid item>
					<Button variant='contained' onClick={handleClickUpdateProjectID}>Update project ID</Button>
				</Grid>
				<Box width="100%"/>
			</Grid>


			<Grid container rowGap={4}>
				<Grid item xs={2}></Grid>
				<ProjectViewTable projectTableRows={projectTableRows} />
				<Box width="100%" />
			</Grid>

			
			<Grid container rowGap={4} spacing={2}>
				<Grid item>
					{componentTreeSelect}
				</Grid>
				<Grid item>
					<Button variant='contained' onClick={handleClick}>Compare selected components</Button>
				</Grid>
				<Box width="100%" />
			</Grid>

			
			<Grid container >
				<Grid item xs={2}></Grid>
				<Grid item>
					<DataTable tableRows={tableRows} />
				</Grid>
			</Grid> 

		</div>
	)
}

export default App; 
