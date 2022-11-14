import axios from 'axios'

export const getAllProjectComponents = async (page, components, projectID) => {
    return axios.get("/components/tree", {
        params: {
            component: projectID,
            qualifiers: "DIR",
            p: page,
            ps: 500
        }
    })
        .then(res => {
            const totalItems = res.data.paging.total
            const pageSize = res.data.paging.pageSize

            components.push(...res.data.components)
            console.log(`getProjectComponentTree() length: ${components.length}`)

            if (Math.ceil(totalItems / pageSize) > page) {
                return getAllProjectComponents(page + 1, components, projectID)
            }
        })
        .catch(err => {
            console.log(err)
        })
}

export const convertComponentsToComponentTreeFormat = (components) => {
    console.log(components)
    let result = []
    components.forEach(elem => {
        const pathArray = (elem.path).split("/")
        addPathToResultArray(result, pathArray, 0)
    })

    // All directories have been added, can now sort alphabetically
    sortComponentTreeRecursively(result)

    console.log(result)
    return result
}

const addPathToResultArray = (result, pathArray, pathArrayIndex) => {
    if (pathArray.length === pathArrayIndex) {
        return
    }
    const current = pathArray[pathArrayIndex]
    for (let i = 0; i < result.length; i++) {
        if (current === result[i].label) {
            addPathToResultArray(result[i].children, pathArray, pathArrayIndex + 1)
            return
        }
    }

    // Else: current does not exist -> add new folder in result
    const path = pathArray.slice(0, pathArrayIndex + 1).reduce((a, b) => a + "/" + b)
    const length = result.push(toAdd(current, path))
    addPathToResultArray(result[length - 1].children, pathArray, pathArrayIndex + 1)
}

const sortComponentTreeRecursively = (array) => {
    array.sort((a, b) => a.label.localeCompare(b.label))
    array.forEach(childArray => {
        sortComponentTreeRecursively(childArray.children)
    })
}

const toAdd = (label, path) => {
    return {
        "label": label,
        "path": path,
        "children": []
    }
}


export const getAllIssues = async (page, issuesList, projectID) => {
    return axios.get("/issues/search", {
        params: {
            projects: projectID,
            p: page,
            ps: 500
        }
    })
        .then(res => {
            const totalIssues = res.data.paging.total
            const pageSize = res.data.paging.pageSize

            // Add all issues from api result to issuesList
            issuesList.push(...res.data.issues)
            console.log(issuesList)
            console.log(totalIssues)

            if (Math.ceil(totalIssues / pageSize) > page) {
                return getAllIssues(page + 1, issuesList, projectID) // Return so the 'await getAllIssues()' waits for recursive calls as well
            }
        })
        .catch(err => {
            console.log(err)
        })
}
