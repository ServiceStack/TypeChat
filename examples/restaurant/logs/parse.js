const fs = require("node:fs/promises")
const fileName = process.argv[2]

async function parseFile(fileName) {
    const json = await fs.readFile(fileName, { encoding: 'utf8' })
    const obj = JSON.parse(json)
    if (obj.length < 2) {
        console.log('File is incomplete')
        return
    }

    const req = obj[0]
    const res = obj[1]
    const content = req.messages[0].content
    const startPos = content.indexOf('"""') + 4
    const endPos = content.indexOf('"""', startPos) - 1

    const request = content.substring(startPos, endPos)
    const response = JSON.parse(res.choices[0].message.content)
    const updated = [
        obj[0],
        obj[1], 
        {
            request,
            response,
        }
    ]
    const updatedJson = JSON.stringify(updated, null, 4)
    console.log(`writing ${fileName}...`)
    await fs.writeFile(fileName, updatedJson, { encoding: 'utf8' })
}

;(async () => {
    if (!fileName) {
        const files = await fs.readdir('.')
        files.filter(x => x.endsWith('.json')).forEach(async fileName => {
            await parseFile(fileName)
        })
    } else if (fileName.endsWith('.json')) {
        await parseFile(fileName)
    } else {
        console.log(`Invalid file ${fileName}`)
    }
    
})()
