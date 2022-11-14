export const compareComponentsAndGiveScore = (components) => {
    const severityBaseScore = { "BLOCKER": 0.8, "CRITICAL": 0.6, "MAJOR": 0.4, "MINOR": 0.2, "INFO": 0 }
    const severityDistributions = [] // for each component
    const resultScores = {}

    let save = calculateScoreForBugsCodeSmellsAndVulnerabilities(components)

    Object.entries(components).forEach(([componentName, issuesList]) => {
        const result = createSeverityDistributionList(issuesList)
        result["componentName"] = componentName // Keep track of the components in severityDistribution (had to be array for .sort())
        severityDistributions.push(result)
    })

    // Sort descending: first by number of blocker issues, if equal then sort by number of critical issues, ...
    severityDistributions.sort((a, b) =>
        b.BLOCKER - a.BLOCKER ||
        b.CRITICAL - a.CRITICAL ||
        b.MAJOR - a.MAJOR ||
        b.MINOR - a.MINOR ||
        b.INFO - a.INFO
    )
    console.log(severityDistributions)

    // Set sorted severity distributions back in object
    components = {}
    severityDistributions.forEach(componentDistribution => {
        const componentName = componentDistribution["componentName"]
        delete componentDistribution["componentName"]
        components[componentName] = componentDistribution
    })

    const testDict = { "BLOCKER": 0, "CRITICAL": 0, "MAJOR": 0, "MINOR": 0, "INFO": 0 }
    const testSave = {}

    // Calculate base score for each component and store it in resultScores
    Object.entries(components).forEach(([componentName, compSeverityDistribution]) => {
        // Finds the highest severity with number of issues > 0, for each component
        for (let [severity, number] of Object.entries(compSeverityDistribution)) {
            if (number > 0) {
                resultScores[componentName] = severityBaseScore[severity]
                testDict[severity] += number
                testSave[componentName] = number
                break
            }
        }
        // If the component has 0 issues
        if (!(componentName in resultScores)) resultScores[componentName] = 0
    })
    console.log(components)
    console.log(resultScores)

    // Add diff score to base score
    const saveScores = {}
    for (let numberOfIssues of Object.values(testDict)) {
        if (numberOfIssues === 0) {
            continue
        }
        let remainingIssues = numberOfIssues
        for (let [componentName, amountIssuesOfMaxSeverity] of Object.entries(testSave)) {
            if (remainingIssues === 0) break
            else if (componentName in saveScores) continue

            const testScore = 0.18 * amountIssuesOfMaxSeverity / numberOfIssues
            saveScores[componentName] = testScore
            remainingIssues -= amountIssuesOfMaxSeverity
        }
    }

    let totalScoreToAdd = 0
    let prevBaseScore = 0
    Object.entries(resultScores).reverse().forEach(([componentName, baseScore]) => {
        if (baseScore != 0) {
            if (prevBaseScore === baseScore) {
                totalScoreToAdd += saveScores[componentName]
            } else {
                totalScoreToAdd = saveScores[componentName]
            }
            resultScores[componentName] += Math.round(totalScoreToAdd * 1e2) / 1e2
            prevBaseScore = baseScore
        }
    })
    console.log(resultScores)
    const rows = []
    Object.entries(resultScores).forEach(([componentName, score]) => {
        const severityDistribution = components[componentName]
        rows.push({
            "componentName": componentName,
            "score": score,
            "bugsGrade": save[componentName].BUG,
            "codeSmellsGrade": save[componentName].CODE_SMELL,
            "vulnerabilitiesGrade": save[componentName].VULNERABILITY,
            "numberOfBugs": save[componentName].numBugs,
            "numberOfCodeSmells": save[componentName].numCodeSmells,
            "numberOfVulnerabilities": save[componentName].numVulnerabilities,
            "totalIssues": save[componentName].totalIssues,
            "blockerIssues": severityDistribution.BLOCKER,
            "criticalIssues": severityDistribution.CRITICAL,
            "majorIssues": severityDistribution.MAJOR,
            "minorIssues": severityDistribution.MINOR,
            "infoIssues": severityDistribution.INFO
        })
    })
    
    return rows
}

const createSeverityDistributionList = (issuesList) => {
    const severityCounter = { "BLOCKER": 0, "CRITICAL": 0, "MAJOR": 0, "MINOR": 0, "INFO": 0 }

    issuesList.forEach(issue => {
        severityCounter[issue.severity]++
    })
    console.log(severityCounter)
    return severityCounter
}

export const calculateScoreForBugsCodeSmellsAndVulnerabilities = (components) => {
    console.log("START")
    const severities = ["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "INFO"]
    const score = { "BLOCKER": "E", "CRITICAL": "D", "MAJOR": "C", "MINOR": "B", "INFO": "A" }
    const result = {}

    console.log(components)
    Object.entries(components).forEach(([componentName, issuesList]) => {
        let s = {} // {"BUG": [], "CODE_SMELL": [], "VULNERABILITY": []}
        
        // Default if ex: 0 vulnerabilities -> A
        result[componentName] = { "totalIssues": issuesList.length, "numBugs": 0, "numCodeSmells": 0, "numVulnerabilities": 0, "BUG": "A", "CODE_SMELL": "A", "VULNERABILITY": "A" } 

        issuesList.forEach(issue => {
            switch (issue.type) {
                case "BUG":
                    result[componentName].numBugs++
                    break
                case "CODE_SMELL":
                    result[componentName].numCodeSmells++
                    break
                case "VULNERABILITY":
                    result[componentName].numVulnerabilities++
                    break
            }

            if (!(issue.type in s)) {
                s[issue.type] = new Set()
            }
            s[issue.type].add(issue.severity)
        })

        Object.keys(s).forEach(key => {
            for (let i = 0; i < severities.length; i++) {
                if (s[key].has(severities[i])) {
                    console.log(componentName, key, severities[i], score[severities[i]])
                    result[componentName][key] = score[severities[i]]
                    break
                }
            }
        })
        console.log(result[componentName])
    })
    console.log("END")
    return result // componentName: {numBugs: 0, numCodeSmells: 0, numVulnerabilities: 0, gradeBugs: "A", ....}
}

export const calculateProjectScore = (components, projectID) => {
    console.log(components.length)
    console.log(components)

    const boundaries = [1.0, 0.8, 0.6, 0.4, 0.2, 0]
    const listScores = []

    components.forEach(component => {
        listScores.push(component.score)
    })
    listScores.sort().reverse()
    console.log(listScores)

    // Look at how many components scores are in the same tier as the top score
    // More gives closer result to next boundary, lower gives closer to +0.01

    let topScore = listScores[0]
    let highBoundary = 0
    let lowBoundary = 0
    let counter = 0

    for (let i = 0; i < 5; i++) {
        if (topScore < boundaries[i]) {
            highBoundary = boundaries[i]
            lowBoundary = boundaries[i+1]
        }
    }


    listScores.forEach(score => {
        if (score >= lowBoundary && score < highBoundary) {
            counter++
        }
    })

    let projectScore = topScore
    for (let i = 0; i < counter; i++) {
        if (projectScore < highBoundary - 0.01) {
            projectScore += 0.01
        }
    }

    console.log(projectScore)

    // Project score ready. Now the rest
    
    const projectTotal = {
        "bugsGrade": "A",
        "codeSmellsGrade": "A",
        "vulnerabilitiesGrade": "A",
        "numberOfBugs": 0,
        "numberOfCodeSmells": 0,
        "numberOfVulnerabilities": 0,
        "totalIssues": 0,
        "blockerIssues": 0,
        "criticalIssues": 0,
        "majorIssues": 0,
        "minorIssues": 0,
        "infoIssues": 0
    }
    components.forEach(component => {
        projectTotal.numberOfBugs += component.numberOfBugs
        projectTotal.numberOfCodeSmells += component.numberOfCodeSmells
        projectTotal.numberOfVulnerabilities += component.numberOfVulnerabilities
        projectTotal.totalIssues += component.totalIssues
        projectTotal.blockerIssues += component.blockerIssues
        projectTotal.criticalIssues += component.criticalIssues
        projectTotal.majorIssues += component.majorIssues
        projectTotal.minorIssues += component.minorIssues
        projectTotal.infoIssues += component.infoIssues

        if ((projectTotal.bugsGrade).localeCompare(component.bugsGrade) === -1) {
            projectTotal.bugsGrade = component.bugsGrade
        }
        if ((projectTotal.codeSmellsGrade).localeCompare(component.codeSmellsGrade) === -1) {
            projectTotal.codeSmellsGrade = component.codeSmellsGrade
        }
        if ((projectTotal.vulnerabilitiesGrade).localeCompare(component.vulnerabilitiesGrade) === -1) {
            projectTotal.vulnerabilitiesGrade = component.vulnerabilitiesGrade
        }
    })

    const rows = []
    rows.push({
        "projectName": projectID,
        "score": projectScore,
        "bugsGrade": projectTotal.bugsGrade,
        "codeSmellsGrade": projectTotal.codeSmellsGrade,
        "vulnerabilitiesGrade": projectTotal.vulnerabilitiesGrade,
        "numberOfBugs": projectTotal.numberOfBugs,
        "numberOfCodeSmells": projectTotal.numberOfCodeSmells,
        "numberOfVulnerabilities": projectTotal.numberOfVulnerabilities,
        "totalIssues": projectTotal.totalIssues,
        "blockerIssues": projectTotal.blockerIssues,
        "criticalIssues": projectTotal.criticalIssues,
        "majorIssues": projectTotal.majorIssues,
        "minorIssues": projectTotal.minorIssues,
        "infoIssues": projectTotal.infoIssues
    })

    return rows
}