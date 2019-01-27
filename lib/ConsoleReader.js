const readline = require('readline')
const process = require('process')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

module.exports = async function readCodeFromConsole(message) {
    return new Promise((resolve, reject) => {
        if (message)
            console.log(`\n${message}`)
        rl.prompt()
        rl.prependOnceListener('line', function(line) {
            resolve(line)
        })
    })
}