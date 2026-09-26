const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const projectRoot = path.resolve(__dirname, '..')
const directories = ['config', 'controllers', 'models', 'routes']
const javascriptFiles = []

for (const directory of directories) {
    const directoryPath = path.join(projectRoot, directory)
    for (const fileName of fs.readdirSync(directoryPath)) {
        if (fileName.endsWith('.js')) javascriptFiles.push(path.join(directoryPath, fileName))
    }
}

javascriptFiles.push(path.join(projectRoot, 'server.js'))

for (const filePath of javascriptFiles) {
    execFileSync(process.execPath, ['--check', filePath], { stdio: 'inherit' })
}

console.log(`Checked ${javascriptFiles.length} JavaScript files successfully.`)