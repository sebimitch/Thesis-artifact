import React from 'react'
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material'

const DataTable = (props) => {
	const rightBorder = { borderRight: '0.01em solid LightGrey', padding: '0.5em' }

	return (
		<Paper>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell colSpan={1} style={rightBorder}></TableCell>
							<TableCell align='center' colSpan={4} style={rightBorder}>Score/Grade</TableCell>
							<TableCell align='center' colSpan={4} style={rightBorder}>Issues</TableCell>
							<TableCell align='center' colSpan={5}>Issue severity distribution</TableCell>
						</TableRow>
						<TableRow>
							<TableCell style={rightBorder}>Component</TableCell>
							<TableCell style={rightBorder}>Risk score</TableCell>
							<TableCell>Bugs</TableCell>
							<TableCell>Code smells</TableCell>
							<TableCell style={rightBorder}>Vulnerabilities</TableCell>
							<TableCell>Bugs</TableCell>
							<TableCell>Code smells</TableCell>
							<TableCell>Vulnerabilities</TableCell>
							<TableCell style={rightBorder}>Total</TableCell>
							<TableCell>Blocker</TableCell>
							<TableCell>Critical</TableCell>
							<TableCell>Major</TableCell>
							<TableCell>Minor</TableCell>
							<TableCell>Info</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{props.tableRows.map((row) => (
							<TableRow key={row.componentName}>
								<TableCell style={rightBorder}>{row.componentName}</TableCell>
								{/* parseFloat to remove unnecessary zeros */}
								<TableCell style={rightBorder} align='center'>{parseFloat((row.score).toFixed(2))}</TableCell>
								<TableCell align='center'>{row.bugsGrade}</TableCell>
								<TableCell align='center'>{row.codeSmellsGrade}</TableCell>
								<TableCell align='center' style={rightBorder}>{row.vulnerabilitiesGrade}</TableCell>
								<TableCell align='center'>{row.numberOfBugs}</TableCell>
								<TableCell align='center'>{row.numberOfCodeSmells}</TableCell>
								<TableCell align='center'>{row.numberOfVulnerabilities}</TableCell>
								<TableCell align='center' style={rightBorder}>{row.totalIssues}</TableCell>
								<TableCell align='center'>{row.blockerIssues}</TableCell>
								<TableCell align='center'>{row.criticalIssues}</TableCell>
								<TableCell align='center'>{row.majorIssues}</TableCell>
								<TableCell align='center'>{row.minorIssues}</TableCell>
								<TableCell align='center'>{row.infoIssues}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Paper>
		
	)
}
export default DataTable;